// Deterministic Clarity Scorer (Pure functions)
// Hard constraints: No LLM involvement in score computation. Explainable line by line.

import {
  Brief,
  BriefItem,
  ClarityDimensionScore,
  ClarityScore,
  Dimension,
  DimensionStatus,
} from "./types";
import clarityConfig from "./experts/clarity.json";

export interface ClarityConfig {
  threshold: number;
  maxQuestions: number;
  minWordCount: number;
  hedgeWords: string[];
  dimensions: Record<
    Dimension,
    {
      weight: number;
      label: string;
      missingReason: string;
      partialReason: string;
      coveredReason: string;
    }
  >;
}

const config = clarityConfig as ClarityConfig;

export const DIMENSION_ORDER: Dimension[] = [
  "goal",
  "audience",
  "problem",
  "evidence",
  "constraints",
  "risk",
];

/**
 * Checks if a text contains any hedge phrases.
 */
export function containsHedge(text: string): boolean {
  const lower = text.toLowerCase();
  return config.hedgeWords.some((hedge) => {
    // Word boundary or substring matching
    return lower.includes(hedge.toLowerCase());
  });
}

/**
 * Evaluates the status of a specific dimension given user items.
 */
function evaluateDimensionStatus(
  dimension: Dimension,
  items: Array<{ text: string; isUserSourced: boolean }>
): { status: DimensionStatus; reason: string } {
  const dimCfg = config.dimensions[dimension];
  if (!items.length) {
    return { status: "missing", reason: dimCfg.missingReason };
  }

  // Check if any item qualifies for covered
  let hasPartial = false;
  let hasCovered = false;

  for (const item of items) {
    if (!item.isUserSourced) continue; // Inferred items never count

    const text = item.text.trim();
    const words = text.split(/\s+/).filter(Boolean);
    const isHedged = containsHedge(text);
    const isShort = words.length < config.minWordCount;

    if (isHedged || isShort) {
      hasPartial = true;
    } else {
      hasCovered = true;
      break;
    }
  }

  if (hasCovered) {
    return { status: "covered", reason: dimCfg.coveredReason };
  }
  if (hasPartial) {
    return { status: "partial", reason: dimCfg.partialReason };
  }
  return { status: "missing", reason: dimCfg.missingReason };
}

/**
 * Computes the deterministic Clarity Score for a given brief.
 */
export function computeClarityScore(
  brief: Brief,
  previousTotal?: number
): ClarityScore {
  // Aggregate user-sourced items by dimension
  const itemsByDim: Record<Dimension, Array<{ text: string; isUserSourced: boolean }>> = {
    goal: [],
    audience: [],
    problem: [],
    evidence: [],
    constraints: [],
    risk: [],
  };

  // 1. Goal (user gave it)
  if (brief.goal && brief.goal.trim().length > 0) {
    itemsByDim.goal.push({
      text: brief.goal,
      isUserSourced: true,
    });
  }

  // 2. Context items
  for (const item of brief.context) {
    const isUser = Boolean(item.sourceTurnId || item.text);
    if (itemsByDim[item.dimension]) {
      itemsByDim[item.dimension].push({ text: item.text, isUserSourced: isUser });
    }
  }

  // 3. Constraints items
  for (const item of brief.constraints) {
    const isUser = Boolean(item.sourceTurnId || item.text);
    if (itemsByDim[item.dimension]) {
      itemsByDim[item.dimension].push({ text: item.text, isUserSourced: isUser });
    }
  }

  // Compute scores per dimension
  let totalScore = 0;
  const dimensionScores = {} as Record<Dimension, ClarityDimensionScore>;

  for (const dim of DIMENSION_ORDER) {
    const dimCfg = config.dimensions[dim];
    const { status, reason } = evaluateDimensionStatus(dim, itemsByDim[dim]);

    let factor = 0;
    if (status === "covered") factor = 1.0;
    else if (status === "partial") factor = 0.5;

    const dimScore = Math.round(dimCfg.weight * factor);
    totalScore += dimScore;

    dimensionScores[dim] = {
      dimension: dim,
      weight: dimCfg.weight,
      status,
      score: dimScore,
      reason: `${dimCfg.label}: ${status.toUpperCase()} (${dimScore}/${dimCfg.weight}) - ${reason}`,
    };
  }

  // Stop rule: score >= threshold AND Goal, Audience, Problem are not Missing
  const coreDimensionsCoveredOrPartial =
    dimensionScores.goal.status !== "missing" &&
    dimensionScores.audience.status !== "missing" &&
    dimensionScores.problem.status !== "missing";

  const isReady = totalScore >= config.threshold && coreDimensionsCoveredOrPartial;

  // Pick target dimension: uncovered or partial dimension with highest weight (order breaks ties)
  const targetDimension = chooseTargetDimension(dimensionScores);

  const delta =
    previousTotal !== undefined ? totalScore - previousTotal : undefined;

  return {
    total: Math.min(100, Math.max(0, totalScore)),
    dimensions: dimensionScores,
    delta,
    targetDimension,
    isReadyForSummary: isReady,
  };
}

/**
 * Chooses the target dimension to probe next:
 * Picks the uncovered (missing) or partial dimension with the highest weight.
 * Ties are broken by DIMENSION_ORDER.
 */
export function chooseTargetDimension(
  dimensions: Record<Dimension, ClarityDimensionScore>
): Dimension {
  let bestDim: Dimension = "goal";
  let highestWeight = -1;

  // Prioritize Missing first, then Partial
  for (const dim of DIMENSION_ORDER) {
    const d = dimensions[dim];
    if (d.status === "missing" && d.weight > highestWeight) {
      highestWeight = d.weight;
      bestDim = dim;
    }
  }

  if (highestWeight > -1) {
    return bestDim;
  }

  // If no missing, look for partial
  highestWeight = -1;
  for (const dim of DIMENSION_ORDER) {
    const d = dimensions[dim];
    if (d.status === "partial" && d.weight > highestWeight) {
      highestWeight = d.weight;
      bestDim = dim;
    }
  }

  if (highestWeight > -1) {
    return bestDim;
  }

  // Fallback to the first dimension in order
  return "goal";
}
