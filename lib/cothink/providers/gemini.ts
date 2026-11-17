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
    const { brief, currentScore, turns, targetDimension } = params;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Construct checklist status string for the prompt
    const checklistStatus = Object.entries(currentScore.dimensions).map(
      ([dim, score]) => `- ${dim.toUpperCase()}: ${score.status.toUpperCase()} (${score.reason})`
    ).join("\n");

    const uncheckedDimensions = Object.entries(currentScore.dimensions)
      .filter(([_, s]) => s.status !== "covered")
      .map(([dim]) => dim);

    const promptPayload = {
      system_instruction: {
        parts: [
          {
            text: `You are an expert strategic advisor conducting an intent-clarifying dialogue.
Your mission is to help clarify the user's brief across six specific dimensions:
1. GOAL (objective)
2. AUDIENCE (target user / persona / context)
3. PROBLEM (acute pain point / friction)
4. EVIDENCE (observations, proof, user data)
5. CONSTRAINTS (budget, time, tech stack, rules)
6. RISK (key assumptions challenged, failure modes)

RULES:
1. CHECKLIST EVALUATION:
   Analyze the user's latest response. If the user provided information addressing any of the dimensions, extract those user-stated facts into briefPatch.context or briefPatch.constraints tagged with the appropriate dimension. Do not invent facts.

2. TARGETED PROBING:
   Review the current checklist. Look at what is NOT checked (Missing or Partial).
   Your next question MUST explicitly ask ONLY for the highest-priority unchecked dimension (${targetDimension}).
   Reference specific details the user previously gave, but keep the question focused directly on filling the missing checkbox.
   Ask exactly ONE concise question.

3. QUICK-REPLY OPTIONS:
   Propose 3 concise, realistic answer options (under 10 words each) tailored to the user's idea as suggestedOptions that the user can tap to answer immediately.

4. STOP RULE:
   If all key dimensions are covered or threshold is reached, set "action": "summarize".

Output strictly valid JSON matching this schema:
{
  "action": "ask" | "summarize",
  "question": "your focused question asking explicitly for the missing dimension",
  "rationale": "Probing: ${targetDimension} - reason",
  "targetDimension": "${targetDimension}",
  "suggestedOptions": [
    "concise answer option 1",
    "concise answer option 2",
    "concise answer option 3"
  ],
  "briefPatch": {
    "context": [
      { "text": "fact extracted from user words", "dimension": "audience | problem | evidence" }
    ],
    "constraints": [
      { "text": "constraint extracted from user words", "dimension": "constraints | risk" }
    ]
  }
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
                currentChecklistStatus: checklistStatus,
                uncheckedDimensionsToTarget: uncheckedDimensions,
                primaryGapToProbeNow: targetDimension,
                brief: {
                  goal: brief.goal,
                  context: brief.context.map((c) => ({ text: c.text, dim: c.dimension })),
                  constraints: brief.constraints.map((c) => ({ text: c.text, dim: c.dimension })),
                },
                conversationTurns: turns.map((t) => ({
                  q: t.question,
                  a: t.answer,
                  probing: t.targetDimension,
                })),
              }),
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
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
