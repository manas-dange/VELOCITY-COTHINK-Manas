// Pure ghost-text autocomplete & suggestion engine
// Hard rules: No LLM, no network calls, strictly deterministic from saved briefs.

import suggestConfig from "./experts/suggest.json";
import { SavedBrief } from "./store/types";

export interface SuggestionResult {
  completionText: string;
  fullSuggestion: string;
  briefId: string;
  matchedBy: "prefix" | "keyword";
}

interface SuggestConfig {
  minChars: number;
  minKeywordOverlap: number;
  debounceMs: number;
}

const config = suggestConfig as SuggestConfig;

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "am", "are",
  "i", "want", "like", "need", "trying", "build", "create", "make", "this", "that"
]);

function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Computes ghost-text suggestion for a typed input given a list of saved briefs.
 * Returns only the remaining completion string to append, or null if no match.
 */
export function getGhostSuggestion(
  typedText: string,
  savedBriefs: SavedBrief[]
): SuggestionResult | null {
  if (!typedText || typedText.length < config.minChars || !savedBriefs.length) {
    return null;
  }

  const trimmed = typedText.trim();
  const lowerTyped = trimmed.toLowerCase();

  // 1. Direct Prefix Matching (Preferred)
  for (const brief of savedBriefs) {
    const goal = brief.goal.trim();
    if (goal.toLowerCase().startsWith(lowerTyped)) {
      const completionText = goal.slice(typedText.length);
      if (completionText.length > 0) {
        return {
          completionText,
          fullSuggestion: goal,
          briefId: brief.id,
          matchedBy: "prefix",
        };
      }
    }
  }

  // 2. Keyword Overlap Fallback
  const typedTokens = extractTokens(trimmed);
  if (typedTokens.length === 0) return null;

  let bestBrief: SavedBrief | null = null;
  let highestOverlap = 0;

  for (const brief of savedBriefs) {
    const briefTokens = new Set([
      ...extractTokens(brief.goal),
      ...(brief.keywords || []).map((k) => k.toLowerCase()),
    ]);

    let overlap = 0;
    for (const token of typedTokens) {
      if (briefTokens.has(token)) {
        overlap++;
      }
    }

    if (overlap >= config.minKeywordOverlap && overlap > highestOverlap) {
      highestOverlap = overlap;
      bestBrief = brief;
    }
  }

  if (bestBrief) {
    const goal = bestBrief.goal.trim();
    // Only return if goal does not already match typed text
    if (goal.toLowerCase() !== lowerTyped) {
      return {
        completionText: ` -> ${goal}`,
        fullSuggestion: goal,
        briefId: bestBrief.id,
        matchedBy: "keyword",
      };
    }
  }

  return null;
}

