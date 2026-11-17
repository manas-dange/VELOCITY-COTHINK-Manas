// LLMProvider interface definition
import {
  Brief,
  ClarityScore,
  Dimension,
  LLMResponsePayload,
  Turn,
} from "../types";

export interface ProviderGenerateParams {
  systemPrompt: string;
  turns: Turn[];
  brief: Brief;
  currentScore: ClarityScore;
  targetDimension: Dimension;
}

export interface LLMProvider {
  name: string;
  isMock: boolean;
  generateResponse(params: ProviderGenerateParams): Promise<LLMResponsePayload>;
}
