// Mock Provider: deterministic, adaptive, no real LLM
// Clearly labelled: "Mock: deterministic, no real LLM"

import {
  Brief,
  BriefItem,
  Dimension,
  LLMResponsePayload,
  Turn,
} from "../types";
import { LLMProvider, ProviderGenerateParams } from "./provider";

export class MockProvider implements LLMProvider {
  name = "Mock: deterministic, no real LLM";
  isMock = true;

  async generateResponse(
    params: ProviderGenerateParams
  ): Promise<LLMResponsePayload> {
    const { brief, currentScore, turns, targetDimension } = params;

    // Check stop condition
    if (currentScore.isReadyForSummary || turns.length >= 6) {
      return {
        action: "summarize",
        rationale: "Threshold reached or maximum questions reached. Brief is ready for summary.",
      };
    }

    // Get last user turn and answer
    const lastTurnWithAnswer = [...turns].reverse().find((t) => t.answer);
    const lastAnswer = lastTurnWithAnswer?.answer?.trim() || brief.goal || "";

    // Extract quote/keyword from the user's last answer
    const snippet = this.extractSnippet(lastAnswer);

    // Generate question & rationale based on targetDimension
    const { question, rationale } = this.generateTargetedQuestion(
      targetDimension,
      snippet,
      brief
    );

    return {
      action: "ask",
      question,
      rationale: `Probing: ${this.getDimensionLabel(targetDimension)} - ${rationale}`,
      targetDimension,
    };
  }

  private getDimensionLabel(dim: Dimension): string {
    const labels: Record<Dimension, string> = {
      goal: "Goal",
      audience: "Audience / Context",
      problem: "Problem",
      evidence: "Evidence",
      constraints: "Constraints",
      risk: "Risk & Assumptions",
    };
    return labels[dim] || dim;
  }

  private extractSnippet(text: string): string {
    if (!text) return "this initiative";
    // Strip common filler prefixes
    const clean = text
      .replace(/^(i want to|i am trying to|we need to|i would like to|i'm building|i plan to)\s+/i, "")
      .trim();

    // If short, return cleaned text; otherwise take first 6-8 words
    const words = clean.split(/\s+/);
    if (words.length <= 6) {
      return clean;
    }
    return words.slice(0, 5).join(" ") + "...";
  }

  private generateTargetedQuestion(
    dim: Dimension,
    snippet: string,
    brief: Brief
  ): { question: string; rationale: string } {
    switch (dim) {
      case "audience":
        return {
          question: `You mentioned "${snippet}". Who specifically is this for, and in what exact situation will they turn to this?`,
          rationale: "Uncovering the primary user persona and contextual triggers.",
        };
      case "problem":
        return {
          question: `Regarding "${snippet}", what critical pain point or friction are they facing that existing solutions fail to solve?`,
          rationale: "Pinpointing the acute problem rather than surface features.",
        };
      case "evidence":
        return {
          question: `What concrete evidence, user observation, or data do you have that proves this is a real problem for them?`,
          rationale: "Validating user demand and factual basis behind the idea.",
        };
      case "constraints":
        return {
          question: `What hard constraints are you operating under—such as timeline, tech stack, budget, or scope limits?`,
          rationale: "Establishing practical boundaries and delivery constraints.",
        };
      case "risk":
        return {
          question: `What is the single riskiest assumption you are making here, and what happens if that assumption turns out to be false?`,
          rationale: "Challenging potential failure modes and unverified assumptions.",
        };
      case "goal":
      default:
        return {
          question: `Can you clarify your core objective with "${snippet}"—what does success look like once this is done?`,
          rationale: "Clarifying the primary objective and desired outcome.",
        };
    }
  }
}
