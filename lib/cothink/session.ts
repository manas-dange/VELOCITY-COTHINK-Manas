// Session state machine for CoThink Module
// Pure, stateless logic: takes a session object, returns updated session + result.

import {
  addBriefItem,
  applyUserEdits,
  createEmptyBrief,
  createItemId,
  populateUnknownsFromGaps,
  removeItemsByTurnId,
} from "./brief";
import { computeClarityScore } from "./clarity";
import { selectExpert } from "./expertSelector";
import { buildFinalPrompt } from "./promptBuilder";
import { LLMProvider } from "./providers/provider";
import {
  Brief,
  BriefEdits,
  ClarityScore,
  ConfirmBriefInput,
  ConfirmBriefOutput,
  CorrectAnswerInput,
  CorrectAnswerOutput,
  Dimension,
  GenerateFinalPromptInput,
  GenerateFinalPromptOutput,
  GenerateNowInput,
  GenerateNowOutput,
  QuestionResult,
  Session,
  StartSessionInput,
  StartSessionOutput,
  SubmitAnswerInput,
  SubmitAnswerOutput,
  SummaryResult,
  Turn,
  UpdateSummaryInput,
  UpdateSummaryOutput,
} from "./types";

const SYSTEM_INSTRUCTION = `You are a strategic CoThink dialogue partner. Clarify intent, challenge assumptions, and follow the target dimension. Return strictly valid JSON.`;

/**
 * Helper to get gaps from current clarity score.
 */
function getGapsFromScore(clarity: ClarityScore) {
  const gaps: Array<{ dimension: Dimension; label: string; reason: string }> = [];
  for (const [dim, dimScore] of Object.entries(clarity.dimensions)) {
    if (dimScore.status !== "covered") {
      gaps.push({
        dimension: dim as Dimension,
        label: dimScore.dimension,
        reason: dimScore.reason,
      });
    }
  }
  return gaps;
}

/**
 * Starts a new CoThink session.
 */
export async function startSession(
  input: StartSessionInput,
  provider: LLMProvider
): Promise<StartSessionOutput> {
  const sessionId = `session_${Date.now()}`;

  if (input.initialIntent && input.initialIntent.trim().length > 0) {
    const intent = input.initialIntent.trim();
    let brief = createEmptyBrief();
    brief.goal = intent;
    brief.goalSourceTurnId = "turn_0";
    brief.expert = selectExpert(intent);

    const initialClarity = computeClarityScore(brief);
    const turn0: Turn = {
      id: "turn_0",
      question: "What are you trying to do?",
      answer: intent,
      targetDimension: "goal",
      rationale: "Initial user intent statement",
      timestamp: Date.now(),
    };

    // Generate first adaptive question
    const targetDim = initialClarity.targetDimension;
    const response = await provider.generateResponse({
      systemPrompt: SYSTEM_INSTRUCTION,
      turns: [turn0],
      brief,
      currentScore: initialClarity,
      targetDimension: targetDim,
    });

    const nextTurnId = `turn_${Date.now()}_1`;
    const questionText = response.question || "Who specifically is this for and what problem does it solve?";
    const questionRationale = response.rationale || `Probing: ${targetDim}`;

    const turn1: Turn = {
      id: nextTurnId,
      question: questionText,
      targetDimension: response.targetDimension || targetDim,
      rationale: questionRationale,
      timestamp: Date.now(),
    };

    const session: Session = {
      id: sessionId,
      stage: "interview",
      turns: [turn0, turn1],
      brief,
      clarity: initialClarity,
      providerName: provider.name,
    };

    return {
      session,
      result: {
        type: "question",
        text: questionText,
        rationale: questionRationale,
        targetDimension: turn1.targetDimension,
      },
      clarity: initialClarity,
    };
  }

  // No initial intent - intake stage
  const brief = createEmptyBrief();
  const initialClarity = computeClarityScore(brief);
  const openingTurn: Turn = {
    id: "turn_0",
    question: "What are you trying to do?",
    targetDimension: "goal",
    timestamp: Date.now(),
  };

  const session: Session = {
    id: sessionId,
    stage: "intake",
    turns: [openingTurn],
    brief,
    clarity: initialClarity,
    providerName: provider.name,
  };

  return {
    session,
    result: {
      type: "question",
      text: openingTurn.question,
      targetDimension: "goal",
    },
    clarity: initialClarity,
  };
}

/**
 * Submits an answer to the current pending turn.
 */
export async function submitAnswer(
  input: SubmitAnswerInput,
  provider: LLMProvider
): Promise<SubmitAnswerOutput> {
  const { session, answer } = input;
  const trimmed = answer.trim();

  let brief = { ...session.brief };
  const turns = [...session.turns];

  if (session.stage === "intake") {
    // Initial intent provided
    brief.goal = trimmed;
    brief.goalSourceTurnId = turns[0].id;
    brief.expert = selectExpert(trimmed);

    turns[0].answer = trimmed;

    const clarity = computeClarityScore(brief, session.clarity.total);
    const targetDim = clarity.targetDimension;

    // Ask first adaptive question
    const response = await provider.generateResponse({
      systemPrompt: SYSTEM_INSTRUCTION,
      turns,
      brief,
      currentScore: clarity,
      targetDimension: targetDim,
    });

    const nextTurn: Turn = {
      id: `turn_${Date.now()}_1`,
      question: response.question || "Who specifically is this for and what problem does it solve?",
      targetDimension: response.targetDimension || targetDim,
      rationale: response.rationale || `Probing: ${targetDim}`,
      timestamp: Date.now(),
    };

    turns.push(nextTurn);

    const updatedSession: Session = {
      ...session,
      stage: "interview",
      turns,
      brief,
      clarity,
      providerName: provider.name,
    };

    return {
      session: updatedSession,
      result: {
        type: "question",
        text: nextTurn.question,
        rationale: nextTurn.rationale,
        targetDimension: nextTurn.targetDimension,
      },
      clarity,
    };
  }

  // Interview stage
  const pendingIndex = turns.findIndex((t) => !t.answer);
  if (pendingIndex === -1) {
    throw new Error("No pending question to answer.");
  }

  const currentTurn = { ...turns[pendingIndex], answer: trimmed };
  turns[pendingIndex] = currentTurn;

  // Tag answer with the turn's targetDimension
  const targetDim: Dimension = currentTurn.targetDimension || "audience";
  if (targetDim === "constraints" || targetDim === "risk") {
    brief = addBriefItem(brief, "constraints", trimmed, targetDim, currentTurn.id);
  } else {
    brief = addBriefItem(brief, "context", trimmed, targetDim, currentTurn.id);
  }

  // Recompute score
  const clarity = computeClarityScore(brief, session.clarity.total);

  // Check stop condition
  if (clarity.isReadyForSummary || turns.length >= 6) {
    brief = populateUnknownsFromGaps(brief, getGapsFromScore(clarity));

    const updatedSession: Session = {
      ...session,
      stage: "summary",
      turns,
      brief,
      clarity,
      providerName: provider.name,
    };

    return {
      session: updatedSession,
      result: {
        type: "summary",
        brief,
      },
      clarity,
    };
  }

  // Generate next question
  const nextTargetDim = clarity.targetDimension;
  const response = await provider.generateResponse({
    systemPrompt: SYSTEM_INSTRUCTION,
    turns,
    brief,
    currentScore: clarity,
    targetDimension: nextTargetDim,
  });

  if (response.action === "summarize") {
    brief = populateUnknownsFromGaps(brief, getGapsFromScore(clarity));

    const updatedSession: Session = {
      ...session,
      stage: "summary",
      turns,
      brief,
      clarity,
      providerName: provider.name,
    };

    return {
      session: updatedSession,
      result: {
        type: "summary",
        brief,
      },
      clarity,
    };
  }

  const nextTurn: Turn = {
    id: `turn_${Date.now()}_${turns.length}`,
    question: response.question || "Could you elaborate further on your constraints and assumptions?",
    targetDimension: response.targetDimension || nextTargetDim,
    rationale: response.rationale || `Probing: ${nextTargetDim}`,
    timestamp: Date.now(),
  };

  turns.push(nextTurn);

  const updatedSession: Session = {
    ...session,
    stage: "interview",
    turns,
    brief,
    clarity,
    providerName: provider.name,
  };

  return {
    session: updatedSession,
    result: {
      type: "question",
      text: nextTurn.question,
      rationale: nextTurn.rationale,
      targetDimension: nextTurn.targetDimension,
    },
    clarity,
  };
}

/**
 * Corrects an earlier answer, updates the brief, and recalculates score.
 */
export async function correctAnswer(
  input: CorrectAnswerInput,
  provider: LLMProvider
): Promise<CorrectAnswerOutput> {
  const { session, turnId, newAnswer } = input;
  const trimmed = newAnswer.trim();

  let brief = removeItemsByTurnId(session.brief, turnId);
  const turns = session.turns.map((t) => {
    if (t.id === turnId) {
      return { ...t, answer: trimmed };
    }
    return t;
  });

  const correctedTurn = turns.find((t) => t.id === turnId);

  // If correcting the initial intent / goal turn
  if (turnId === session.brief.goalSourceTurnId || correctedTurn?.targetDimension === "goal") {
    brief.goal = trimmed;
    brief.expert = selectExpert(trimmed);
  } else if (correctedTurn) {
    const dim = correctedTurn.targetDimension || "audience";
    if (dim === "constraints" || dim === "risk") {
      brief = addBriefItem(brief, "constraints", trimmed, dim, turnId);
    } else {
      brief = addBriefItem(brief, "context", trimmed, dim, turnId);
    }
  }

  const clarity = computeClarityScore(brief, session.clarity.total);

  // Any edit or correction after summary returns the session to summary and clears confirmation
  let nextStage = session.stage;
  if (session.stage === "confirmed" || session.stage === "final") {
    nextStage = "summary";
  }

  if (nextStage === "summary") {
    brief = populateUnknownsFromGaps(brief, getGapsFromScore(clarity));
    const updatedSession: Session = {
      ...session,
      stage: "summary",
      turns,
      brief,
      clarity,
      providerName: provider.name,
    };

    return {
      session: updatedSession,
      result: {
        type: "summary",
        brief,
      },
      clarity,
    };
  }

  // If in interview, check if stop rule is met
  if (clarity.isReadyForSummary || turns.length >= 6) {
    brief = populateUnknownsFromGaps(brief, getGapsFromScore(clarity));
    const updatedSession: Session = {
      ...session,
      stage: "summary",
      turns,
      brief,
      clarity,
      providerName: provider.name,
    };

    return {
      session: updatedSession,
      result: {
        type: "summary",
        brief,
      },
      clarity,
    };
  }

  const lastPending = turns.find((t) => !t.answer);
  const updatedSession: Session = {
    ...session,
    stage: "interview",
    turns,
    brief,
    clarity,
    providerName: provider.name,
  };

  return {
    session: updatedSession,
    result: {
      type: "question",
      text: lastPending?.question || "What else would you like to clarify?",
      rationale: lastPending?.rationale,
      targetDimension: lastPending?.targetDimension,
    },
    clarity,
  };
}

/**
 * Generate now: skips remaining questions and moves directly to summary.
 */
export async function generateNow(
  input: GenerateNowInput
): Promise<GenerateNowOutput> {
  const { session } = input;
  const clarity = computeClarityScore(session.brief, session.clarity.total);
  const brief = populateUnknownsFromGaps(session.brief, getGapsFromScore(clarity));

  const updatedSession: Session = {
    ...session,
    stage: "summary",
    brief,
    clarity,
  };

  return {
    session: updatedSession,
    result: {
      type: "summary",
      brief,
    },
    clarity,
  };
}

/**
 * Updates summary fields edited by the user. User edits always win.
 */
export async function updateSummary(
  input: UpdateSummaryInput
): Promise<UpdateSummaryOutput> {
  const { session, edits } = input;
  const brief = applyUserEdits(session.brief, edits);
  const clarity = computeClarityScore(brief, session.clarity.total);

  // If session was confirmed or final, return to summary
  const nextStage = "summary";

  const updatedSession: Session = {
    ...session,
    stage: nextStage,
    brief,
    clarity,
  };

  return {
    session: updatedSession,
    result: {
      brief,
    },
    clarity,
  };
}

/**
 * Confirms the brief. Rejects if no goal exists.
 */
export async function confirmBrief(
  input: ConfirmBriefInput
): Promise<ConfirmBriefOutput> {
  const { session } = input;

  if (!session.brief.goal || session.brief.goal.trim().length === 0) {
    throw new Error("Brief cannot be confirmed without a goal.");
  }

  const updatedSession: Session = {
    ...session,
    stage: "confirmed",
  };

  return {
    session: updatedSession,
    result: {
      confirmed: true,
    },
    clarity: session.clarity,
  };
}

/**
 * Generates the final prompt. Only valid when confirmed.
 */
export async function generateFinalPrompt(
  input: GenerateFinalPromptInput
): Promise<GenerateFinalPromptOutput> {
  const { session } = input;

  if (session.stage !== "confirmed" && session.stage !== "final") {
    throw new Error("Brief must be confirmed before generating the final prompt.");
  }

  const { prompt, meta } = buildFinalPrompt(
    session.brief,
    session.providerName,
    session.clarity.total
  );

  const updatedSession: Session = {
    ...session,
    stage: "final",
  };

  return {
    session: updatedSession,
    result: {
      prompt,
      meta,
    },
    clarity: session.clarity,
  };
}

/**
 * Returns current clarity object.
 */
export function getClarity(session: Session): ClarityScore {
  return session.clarity;
}
