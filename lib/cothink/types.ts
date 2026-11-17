// Core domain types for CoThink Module
// Hard constraint: No imports from app/, components/, or hooks/

export type Dimension =
  | "goal"
  | "audience"
  | "problem"
  | "evidence"
  | "constraints"
  | "risk";

export type DimensionStatus = "covered" | "partial" | "missing";

export interface ClarityDimensionScore {
  dimension: Dimension;
  weight: number;
  status: DimensionStatus;
  score: number;
  reason: string;
}

export interface ClarityScore {
  total: number;
  dimensions: Record<Dimension, ClarityDimensionScore>;
  delta?: number;
  targetDimension: Dimension;
  isReadyForSummary: boolean;
}

export interface BriefItem {
  id: string;
  text: string;
  sourceTurnId?: string;
  dimension: Dimension;
}

export interface BriefUnknown {
  id: string;
  text: string;
  dimension?: Dimension;
}

export interface BriefAssumption {
  id: string;
  text: string;
  dimension?: Dimension;
}

export interface BriefExpert {
  role: string;
  rationale: string;
}

export interface Brief {
  goal: string;
  goalSourceTurnId?: string;
  context: BriefItem[];
  constraints: BriefItem[];
  unknowns: BriefUnknown[];
  assumptions: BriefAssumption[];
  expert?: BriefExpert;
}

export type SessionStage =
  | "intake"
  | "interview"
  | "summary"
  | "confirmed"
  | "final";

export interface Turn {
  id: string;
  question: string;
  answer?: string;
  targetDimension?: Dimension;
  rationale?: string;
  suggestedOptions?: string[];
  timestamp: number;
}

export interface Session {
  id: string;
  stage: SessionStage;
  turns: Turn[];
  brief: Brief;
  clarity: ClarityScore;
  providerName: string;
}

export type QuestionResult = {
  type: "question";
  text: string;
  rationale?: string;
  targetDimension?: Dimension;
  suggestedOptions?: string[];
};

export type SummaryResult = {
  type: "summary";
  brief: Brief;
};

export interface StartSessionInput {
  initialIntent?: string;
}

export interface StartSessionOutput {
  session: Session;
  result: QuestionResult;
  clarity: ClarityScore;
}

export interface SubmitAnswerInput {
  session: Session;
  answer: string;
}

export interface SubmitAnswerOutput {
  session: Session;
  result: QuestionResult | SummaryResult;
  clarity: ClarityScore;
}

export interface CorrectAnswerInput {
  session: Session;
  turnId: string;
  newAnswer: string;
}

export interface CorrectAnswerOutput {
  session: Session;
  result: QuestionResult | SummaryResult;
  clarity: ClarityScore;
}

export interface GenerateNowInput {
  session: Session;
}

export interface GenerateNowOutput {
  session: Session;
  result: SummaryResult;
  clarity: ClarityScore;
}

export interface BriefEdits {
  goal?: string;
  context?: BriefItem[];
  constraints?: BriefItem[];
  unknowns?: BriefUnknown[];
  assumptions?: BriefAssumption[];
  expert?: BriefExpert;
}

export interface UpdateSummaryInput {
  session: Session;
  edits: BriefEdits;
}

export interface UpdateSummaryOutput {
  session: Session;
  result: { brief: Brief };
  clarity: ClarityScore;
}

export interface ConfirmBriefInput {
  session: Session;
}

export interface ConfirmBriefOutput {
  session: Session;
  result: { confirmed: boolean };
  clarity: ClarityScore;
}

export interface FinalPromptMeta {
  expertRole: string;
  methods: string[];
  provider: string;
  finalClarity: number;
}

export interface GenerateFinalPromptInput {
  session: Session;
}

export interface GenerateFinalPromptOutput {
  session: Session;
  result: {
    prompt: string;
    meta: FinalPromptMeta;
  };
  clarity: ClarityScore;
}

export interface LLMResponsePayload {
  action: "ask" | "summarize";
  question?: string;
  rationale?: string;
  targetDimension?: Dimension;
  suggestedOptions?: string[];
  briefPatch?: {
    goal?: string;
    context?: Array<{ text: string; dimension: Dimension }>;
    constraints?: Array<{ text: string; dimension: Dimension }>;
    unknowns?: Array<{ text: string; dimension?: Dimension }>;
    assumptions?: Array<{ text: string; dimension?: Dimension }>;
    expert?: BriefExpert;
  };
}
