// Mock provider stub
import { LLMProvider } from "./provider";

export class MockProvider implements LLMProvider {
  name = "Mock: deterministic, no real LLM";
  isMock = true;
}
