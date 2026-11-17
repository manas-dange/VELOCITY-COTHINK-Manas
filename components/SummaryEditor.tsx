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
    const edits = getEditsPayload();
    await onUpdate(edits);
    setHasUnsavedEdits(false);
  };

  const canConfirm = goal.trim().length > 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Pinned Score in Summary */}
      <ClarityMeter clarity={clarity} />

      {/* Header */}
      <div className="border-b pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Structured Brief Review
          </h2>
          <p className="text-xs text-slate-500">
            Review and refine your brief. Labelled unknowns & assumptions are marked.
          </p>
        </div>
        {brief.expert && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Perspective
            </span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
              {brief.expert.role}
            </span>
          </div>
        )}
      </div>

      {/* Goal Section */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Primary Goal <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={goal}
          onChange={(e) => handleFieldChange("goal", e.target.value)}
          rows={2}
          className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          placeholder="What are you trying to accomplish?"
        />
        {!goal.trim() && (
          <p className="text-[11px] text-rose-500 font-medium">
            Goal is required to confirm the brief.
          </p>
        )}
      </div>

      {/* Context Section */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Verified Context & Audience (one per line)
        </label>
        <textarea
          value={contextText}
          onChange={(e) => handleFieldChange("context", e.target.value)}
          rows={3}
          className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          placeholder="Target users, situations, problem context..."
        />
      </div>

      {/* Constraints Section */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Stated Constraints (one per line)
        </label>
        <textarea
          value={constraintsText}
          onChange={(e) => handleFieldChange("constraints", e.target.value)}
          rows={2}
          className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          placeholder="Budget, timelines, tech stack, boundaries..."
        />
      </div>

      {/* Labelled Unknowns Section */}
      <div className="space-y-1.5 bg-amber-50/60 border border-amber-200/80 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
            [UNKNOWN] Unanswered Areas / Gaps
          </label>
          <span className="text-[10px] text-amber-700 font-medium">
            Identified by Clarity Scorer
          </span>
        </div>
        <textarea
          value={unknownsText}
          onChange={(e) => handleFieldChange("unknowns", e.target.value)}
          rows={3}
          className="w-full text-xs text-amber-950 bg-white/90 border border-amber-200 rounded-md p-2 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          placeholder="List any known unknowns (e.g. [UNKNOWN] Audience size: not yet determined)"
        />
      </div>

      {/* Labelled Assumptions Section */}
      <div className="space-y-1.5 bg-purple-50/60 border border-purple-200/80 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
            [ASSUMPTION] Inferred / Working Assumptions
          </label>
          <span className="text-[10px] text-purple-700 font-medium">
            Never treated as verified facts
          </span>
        </div>
        <textarea
          value={assumptionsText}
          onChange={(e) => handleFieldChange("assumptions", e.target.value)}
          rows={2}
          className="w-full text-xs text-purple-950 bg-white/90 border border-purple-200 rounded-md p-2 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
          placeholder="List working assumptions (e.g. [ASSUMPTION] Users have modern smartphones)"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        {hasUnsavedEdits && (
          <button
            type="button"
            onClick={handleSaveEdits}
            disabled={loading}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Updating..." : "Save Edits & Recalculate Score"}
          </button>
        )}

        <button
          type="button"
          onClick={async () => {
            const edits = hasUnsavedEdits ? getEditsPayload() : undefined;
            await onConfirm(edits);
          }}
          disabled={!canConfirm || loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>✓ Confirm Brief & Generate Final Prompt</span>
        </button>
      </div>
    </div>
  );
}
