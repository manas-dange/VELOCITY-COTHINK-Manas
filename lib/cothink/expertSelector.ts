// Expert selector logic: matches user intent against experts.json
import expertsData from "./experts/experts.json";
import { BriefExpert } from "./types";

interface ExpertConfig {
  id: string;
  role: string;
  description: string;
  keywords: string[];
  rationale: string;
}

const experts = expertsData as ExpertConfig[];

/**
 * Selects an expert based on the initial intent text.
 * Falls back to Generalist Fallback if unsure.
 */
export function selectExpert(intent: string): BriefExpert {
  const lower = intent.toLowerCase();

  let bestMatch: ExpertConfig | null = null;
  let highestScore = 0;

  for (const exp of experts) {
    if (exp.id === "generalist_fallback") continue;

    let score = 0;
    for (const kw of exp.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score++;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = exp;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      role: bestMatch.role,
      rationale: bestMatch.rationale,
    };
  }

  // Fallback
  const fallback = experts.find((e) => e.id === "generalist_fallback") || {
    role: "Generalist Strategic Advisor",
    rationale: "Selected as a multi-disciplinary strategic advisor to clarify intent and challenge assumptions.",
  };

  return {
    role: fallback.role,
    rationale: fallback.rationale,
  };
}
