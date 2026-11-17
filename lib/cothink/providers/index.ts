// Provider factory
import { GeminiProvider } from "./gemini";
import { MockProvider } from "./mock";
import { LLMProvider } from "./provider";

export * from "./gemini";
export * from "./mock";
export * from "./provider";

export function getProvider(preferred?: string): LLMProvider {
  const providerType = preferred || process.env.COTHINK_PROVIDER || "mock";
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (providerType.toLowerCase() === "gemini") {
    if (apiKey && apiKey.trim().length > 0) {
      return new GeminiProvider(apiKey.trim(), model);
    }
    // Silently fall back to mock if no API key is present
  }

  return new MockProvider();
}
