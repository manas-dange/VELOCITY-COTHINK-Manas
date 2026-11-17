// CoThink Public API
// Module independence: Everything under lib/cothink/ works with zero imports from app/, components/, or hooks/

import { getProvider } from "./providers/index";
import * as sessionModule from "./session";
import {
  ConfirmBriefInput,
  ConfirmBriefOutput,
  CorrectAnswerInput,
  CorrectAnswerOutput,
  GenerateFinalPromptInput,
  GenerateFinalPromptOutput,
  GenerateNowInput,
  GenerateNowOutput,
  StartSessionInput,
  StartSessionOutput,
  SubmitAnswerInput,
  SubmitAnswerOutput,
  UpdateSummaryInput,
  UpdateSummaryOutput,
} from "./types";

export * from "./types";
export * from "./providers/index";
export { computeClarityScore, chooseTargetDimension } from "./clarity";
export { selectExpert } from "./expertSelector";
export { buildFinalPrompt } from "./promptBuilder";
export { getClarity } from "./session";

/**
 * Starts a new CoThink session.
 */
export async function startSession(
  input: StartSessionInput,
  provider = getProvider()
): Promise<StartSessionOutput> {
  return sessionModule.startSession(input, provider);
}

/**
 * Submits an answer to the current pending turn.
 */
export async function submitAnswer(
  input: SubmitAnswerInput,
  provider = getProvider()
): Promise<SubmitAnswerOutput> {
  return sessionModule.submitAnswer(input, provider);
}

/**
 * Corrects an earlier answer, recalculating brief items and clarity score.
 */
export async function correctAnswer(
  input: CorrectAnswerInput,
  provider = getProvider()
): Promise<CorrectAnswerOutput> {
  return sessionModule.correctAnswer(input, provider);
}

/**
 * Skips remaining questions and moves directly to summary, populating unknowns for gaps.
 */
export async function generateNow(
  input: GenerateNowInput
): Promise<GenerateNowOutput> {
  return sessionModule.generateNow(input);
}

/**
 * Updates summary fields edited by the user. User edits always win.
 */
export async function updateSummary(
  input: UpdateSummaryInput
): Promise<UpdateSummaryOutput> {
  return sessionModule.updateSummary(input);
}

/**
 * Confirms the brief. Rejects if no goal exists.
 */
export async function confirmBrief(
  input: ConfirmBriefInput
): Promise<ConfirmBriefOutput> {
  return sessionModule.confirmBrief(input);
}

/**
 * Generates the final prompt. Only valid when confirmed.
 */
export async function generateFinalPrompt(
  input: GenerateFinalPromptInput
): Promise<GenerateFinalPromptOutput> {
  return sessionModule.generateFinalPrompt(input);
}
