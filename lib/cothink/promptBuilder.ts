// Final prompt builder: deterministic assembly from confirmed brief
// Hard constraints: No extra LLM call, faithful by construction, methods as instructions not tools.

import methodsData from "./experts/methods.json";
import { Brief, FinalPromptMeta } from "./types";

interface MethodConfig {
  id: string;
  name: string;
  instruction: string;
}

const methods = methodsData as MethodConfig[];

export interface BuildFinalPromptResult {
  prompt: string;
  meta: FinalPromptMeta;
}

export function buildFinalPrompt(
  brief: Brief,
  providerName: string,
  finalClarity: number
): BuildFinalPromptResult {
  const expertRole = brief.expert?.role || "Generalist Strategic Advisor";

  // Select 2 to 3 appropriate methods
  const selectedMethods = [
    methods[0], // Pre-Mortem
    methods[3], // Trade-Off Framing
    methods[4], // Restate & Challenge
  ].filter(Boolean);

  const methodNames = selectedMethods.map((m) => m.name);

  const sections: string[] = [];

  // 1. Role
  sections.push(
    `### Role & Identity\nYou are a seasoned ${expertRole}. Your role is to think rigorously alongside the user, challenge unverified assumptions, and provide high-impact, actionable guidance.`
  );

  // 2. Goal
  sections.push(
    `### Objective / Goal\n${brief.goal || "Not specified."}`
  );

  // 3. User-Stated Context
  if (brief.context.length > 0) {
    const contextItems = brief.context.map((c) => `- [${c.dimension.toUpperCase()}] ${c.text}`).join("\n");
    sections.push(`### Verified Context\n${contextItems}`);
  } else {
    sections.push(`### Verified Context\nNone provided.`);
  }

  // 4. Stated Constraints
  if (brief.constraints.length > 0) {
    const constraintItems = brief.constraints.map((c) => `- [${c.dimension.toUpperCase()}] ${c.text}`).join("\n");
    sections.push(`### Explicit Constraints\n${constraintItems}`);
  } else {
    sections.push(`### Explicit Constraints\nNone provided.`);
  }

  // 5. Assumptions and Unknowns (Explicitly labelled)
  const flagList: string[] = [];
  if (brief.assumptions.length > 0) {
    brief.assumptions.forEach((a) => flagList.push(`- [ASSUMPTION] ${a.text}`));
  }
  if (brief.unknowns.length > 0) {
    brief.unknowns.forEach((u) => flagList.push(`- [UNKNOWN] ${u.text}`));
  }

  if (flagList.length > 0) {
    sections.push(
      `### Critical Assumptions & Unknowns\nTreat the following items as unverified signals or known gaps. Do NOT treat them as confirmed facts:\n${flagList.join("\n")}`
    );
  }

  // 6. Method Instructions (instructions, NOT tools)
  const methodInstructions = selectedMethods
    .map((m, idx) => `${idx + 1}. **${m.name}**: ${m.instruction}`)
    .join("\n");
  sections.push(`### Advisory Methodology (Follow these instructions)\n${methodInstructions}`);

  // 7. Output Expectations
  sections.push(
    `### Output Expectations\nDeliver a structured, clear response. Structure your reply with direct answers, concrete recommendations, explicit trade-offs, and next milestone actions.`
  );

  // 8. Honesty Rule
  sections.push(
    `### Rigor & Grounding Rule\nDo not invent or fabricate facts about the user's situation, organization, or data. If critical information is missing to formulate a recommendation, explicitly state what is assumed or ask for clarification.`
  );

  const prompt = sections.join("\n\n");

  return {
    prompt,
    meta: {
      expertRole,
      methods: methodNames,
      provider: providerName,
      finalClarity,
    },
  };
}
