// Brief model and revision handling
// Hard constraint: items must be traceable to sourceTurnId with dimension tags.

import {
  Brief,
  BriefAssumption,
  BriefEdits,
  BriefItem,
  BriefUnknown,
  Dimension,
} from "./types";

export function createEmptyBrief(): Brief {
  return {
    goal: "",
    context: [],
    constraints: [],
    unknowns: [],
    assumptions: [],
  };
}

/**
 * Creates a unique ID for brief items.
 */
export function createItemId(prefix = "item"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Adds an item to context or constraints, tagged with dimension and sourceTurnId.
 */
export function addBriefItem(
  brief: Brief,
  targetList: "context" | "constraints",
  text: string,
  dimension: Dimension,
  sourceTurnId?: string
): Brief {
  const newItem: BriefItem = {
    id: createItemId(targetList),
    text: text.trim(),
    dimension,
    sourceTurnId,
  };

  return {
    ...brief,
    [targetList]: [...brief[targetList], newItem],
  };
}

/**
 * Removes all items sourced from a specific turnId.
 * Used when a user corrects a previous answer.
 */
export function removeItemsByTurnId(brief: Brief, turnId: string): Brief {
  const updatedContext = brief.context.filter(
    (item) => item.sourceTurnId !== turnId
  );
  const updatedConstraints = brief.constraints.filter(
    (item) => item.sourceTurnId !== turnId
  );

  let updatedGoal = brief.goal;
  if (brief.goalSourceTurnId === turnId) {
    updatedGoal = "";
  }

  return {
    ...brief,
    goal: updatedGoal,
    context: updatedContext,
    constraints: updatedConstraints,
  };
}

/**
 * Applies user edits to the brief in the summary view.
 * User edits always win.
 */
export function applyUserEdits(brief: Brief, edits: BriefEdits): Brief {
  return {
    ...brief,
    goal: edits.goal !== undefined ? edits.goal : brief.goal,
    context: edits.context !== undefined ? edits.context : brief.context,
    constraints:
      edits.constraints !== undefined ? edits.constraints : brief.constraints,
    unknowns: edits.unknowns !== undefined ? edits.unknowns : brief.unknowns,
    assumptions:
      edits.assumptions !== undefined ? edits.assumptions : brief.assumptions,
    expert: edits.expert !== undefined ? edits.expert : brief.expert,
  };
}

/**
 * Populates unknowns for missing/partial dimensions when moving to summary or on generateNow.
 */
export function populateUnknownsFromGaps(
  brief: Brief,
  gaps: Array<{ dimension: Dimension; label: string; reason: string }>
): Brief {
  const existingUnknownTexts = new Set(brief.unknowns.map((u) => u.text.toLowerCase()));
  const newUnknowns: BriefUnknown[] = [...brief.unknowns];

  for (const gap of gaps) {
    const text = `UNKNOWN: ${gap.label} - ${gap.reason}`;
    if (!existingUnknownTexts.has(text.toLowerCase())) {
      newUnknowns.push({
        id: createItemId("unk"),
        text,
        dimension: gap.dimension,
      });
      existingUnknownTexts.add(text.toLowerCase());
    }
  }

  return {
    ...brief,
    unknowns: newUnknowns,
  };
}
