// Gemini Provider: calls Gemini API server-side
// Never runs in browser. Never logs API key. Fallbacks safely to mock on errors.

import { Brief, ClarityScore, Dimension, LLMResponsePayload, Turn } from "../types";
import { MockProvider } from "./mock";
import { LLMProvider, ProviderGenerateParams } from "./provider";

export class GeminiProvider implements LLMProvider {
  name = "Gemini";
  isMock = false;

  private apiKey: string;
  private model: string;
  private fallbackMock: MockProvider;

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.apiKey = apiKey;
    this.model = model || "gemini-1.5-flash";
    this.fallbackMock = new MockProvider();
  }

  async generateResponse(
    params: ProviderGenerateParams
  ): Promise<LLMResponsePayload> {
    const { brief, currentScore, turns, targetDimension } = params;

    if (currentScore.isReadyForSummary || turns.length >= 6) {
      return {
        action: "summarize",
        rationale: "Threshold reached or maximum questions reached.",
      };
    }

    try {
      return await this.callWithRetry(params, 1);
    } catch (err) {
      console.warn("GeminiProvider failed, falling back to adaptive mock:", err);
      return await this.fallbackMock.generateResponse(params);
    }
  }

  private async callWithRetry(
    params: ProviderGenerateParams,
    retriesLeft: number
  ): Promise<LLMResponsePayload> {
    const { brief, turns, targetDimension } = params;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const promptPayload = {
      system_instruction: {
        parts: [
          {
            text: `You are an expert strategic advisor conducting an intent-clarifying dialogue.
Rule: Ask ONE question per turn. Keep it brief.
Grounding: Reference the user's last answer specifically.
Target: Probe the dimension "${targetDimension}".
Challenge assumptions or reasoning gaps. Do not invent facts.
Output strictly JSON matching:
{
  "action": "ask",
  "question": "your question",
  "rationale": "Probing: ${targetDimension} - reason",
  "targetDimension": "${targetDimension}"
}`,
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                goal: brief.goal,
                context: brief.context.map((c) => ({ text: c.text, dim: c.dimension })),
                constraints: brief.constraints.map((c) => ({ text: c.text, dim: c.dimension })),
                conversationTurns: turns.map((t) => ({
                  q: t.question,
                  a: t.answer,
                  probing: t.targetDimension,
                })),
                targetDimensionToProbe: targetDimension,
              }),
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptPayload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Gemini API error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Empty response from Gemini API");
      }

      const parsed = JSON.parse(rawText) as LLMResponsePayload;
      if (!parsed.question && parsed.action === "ask") {
        throw new Error("Missing question in Gemini response");
      }

      return parsed;
    } catch (err) {
      clearTimeout(timeout);
      if (retriesLeft > 0) {
        return this.callWithRetry(params, retriesLeft - 1);
      }
      throw err;
    }
  }
}
