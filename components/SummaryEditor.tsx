import React, { useState } from "react";
import { Brief, BriefEdits, ClarityScore } from "@/lib/cothink/types";
import { ClarityMeter } from "./ClarityMeter";

interface SummaryEditorProps {
  brief: Brief;
  clarity: ClarityScore;
  loading: boolean;
  onUpdate: (edits: BriefEdits) => Promise<any>;
  onConfirm: (edits?: BriefEdits) => Promise<any>;
}

export function SummaryEditor({
  brief,
  clarity,
  loading,
  onUpdate,
  onConfirm,
}: SummaryEditorProps) {
  const [goal, setGoal] = useState(brief.goal);
  const [contextText, setContextText] = useState(
    brief.context.map((c) => c.text).join("\n")
  );
  const [constraintsText, setConstraintsText] = useState(
    brief.constraints.map((c) => c.text).join("\n")
  );
  const [unknownsText, setUnknownsText] = useState(
    brief.unknowns.map((u) => u.text).join("\n")
  );
  const [assumptionsText, setAssumptionsText] = useState(
    brief.assumptions.map((a) => a.text).join("\n")
  );

  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  const handleFieldChange = (field: string, val: string) => {
    setHasUnsavedEdits(true);
    if (field === "goal") setGoal(val);
    if (field === "context") setContextText(val);
    if (field === "constraints") setConstraintsText(val);
    if (field === "unknowns") setUnknownsText(val);
    if (field === "assumptions") setAssumptionsText(val);
  };

  const getEditsPayload = (): BriefEdits => {
    const newContext = contextText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, idx) => {
        const existing = brief.context[idx];
        return {
          id: existing?.id || `ctx_${idx}`,
          text,
          dimension: existing?.dimension || ("audience" as const),
          sourceTurnId: existing?.sourceTurnId,
        };
      });

    const newConstraints = constraintsText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, idx) => {
        const existing = brief.constraints[idx];
        return {
          id: existing?.id || `cons_${idx}`,
          text,
          dimension: existing?.dimension || ("constraints" as const),
          sourceTurnId: existing?.sourceTurnId,
        };
      });

    const newUnknowns = unknownsText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `unk_${idx}`,
        text,
      }));

    const newAssumptions = assumptionsText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `assump_${idx}`,
        text,
      }));

    return {
      goal: goal.trim(),
      context: newContext,
      constraints: newConstraints,
      unknowns: newUnknowns,
      assumptions: newAssumptions,
    };
  };

  const handleSaveEdits = async () => {
    if (loading) return;
    const payload = getEditsPayload();
    await onUpdate(payload);
    setHasUnsavedEdits(false);
  };

  const handleConfirm = async () => {
    if (loading) return;
    const payload = hasUnsavedEdits ? getEditsPayload() : undefined;
    await onConfirm(payload);
  };

  const isGoalValid = goal.trim().length > 0;

  return (
    <div className="space-y-4 pb-6 overflow-y-auto">
      <ClarityMeter clarity={clarity} pinned />

      {/* Banner */}
      <div className="bg-[#1e1538]/80 border border-purple-500/20 rounded-2xl p-3.5 space-y-1">
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          <span>📋</span> Review & Confirm Intent Brief
        </h2>
        <p className="text-xs text-purple-300/80 leading-relaxed">
          Verify and edit the structured brief. When ready, confirm to generate your production-grade prompt.
        </p>
      </div>

      {/* Editable Fields */}
      <div className="space-y-3 text-xs">
        {/* Goal Field */}
        <div className="space-y-1">
          <label className="font-bold text-slate-200 flex items-center justify-between">
            <span>Primary Goal *</span>
            {!isGoalValid && (
              <span className="text-rose-400 font-normal">Goal cannot be empty</span>
            )}
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => handleFieldChange("goal", e.target.value)}
            disabled={loading}
            className={`w-full bg-[#130d26] border rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none transition-colors ${
              isGoalValid ? "border-purple-500/30 focus:border-purple-400" : "border-rose-500/50"
            }`}
            placeholder="Primary goal is required..."
          />
        </div>

        {/* Context / Facts */}
        <div className="space-y-1">
          <label className="font-bold text-slate-200">
            Context & Background Facts (one per line)
          </label>
          <textarea
            value={contextText}
            onChange={(e) => handleFieldChange("context", e.target.value)}
            disabled={loading}
            rows={3}
            className="w-full bg-[#130d26] border border-purple-500/30 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400 resize-none"
            placeholder="Add relevant facts..."
          />
        </div>

        {/* Constraints */}
        <div className="space-y-1">
          <label className="font-bold text-slate-200">
            Constraints & Guardrails (one per line)
          </label>
          <textarea
            value={constraintsText}
            onChange={(e) => handleFieldChange("constraints", e.target.value)}
            disabled={loading}
            rows={2}
            className="w-full bg-[#130d26] border border-purple-500/30 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400 resize-none"
            placeholder="e.g. Budget under $500, no third-party APIs..."
          />
        </div>

        {/* Labelled Unknowns */}
        <div className="space-y-1">
          <label className="font-bold text-amber-300 flex items-center gap-1">
            <span>⚠️</span> Labelled Unknowns (generated or flagged)
          </label>
          <textarea
            value={unknownsText}
            onChange={(e) => handleFieldChange("unknowns", e.target.value)}
            disabled={loading}
            rows={2}
            className="w-full bg-[#191124] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400 resize-none"
            placeholder="Unconfirmed items will be highlighted as unknowns..."
          />
        </div>

        {/* Assumptions */}
        <div className="space-y-1">
          <label className="font-bold text-slate-200">
            Assumptions (working hypotheses)
          </label>
          <textarea
            value={assumptionsText}
            onChange={(e) => handleFieldChange("assumptions", e.target.value)}
            disabled={loading}
            rows={2}
            className="w-full bg-[#130d26] border border-purple-500/30 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400 resize-none"
            placeholder="Assumptions to validate..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        {hasUnsavedEdits && (
          <button
            type="button"
            onClick={handleSaveEdits}
            disabled={loading}
            className="w-full py-2 bg-[#22173f] hover:bg-[#2e1f54] text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            {loading ? "Saving..." : "Save Edits & Recalculate Score"}
          </button>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading || !isGoalValid}
          className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] disabled:opacity-40 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{loading ? "Generating Final Prompt..." : "Confirm Brief & Generate Final Prompt →"}</span>
        </button>
      </div>
    </div>
  );
}
