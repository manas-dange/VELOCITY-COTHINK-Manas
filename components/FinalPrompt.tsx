import React, { useState } from "react";
import { FinalPromptMeta } from "@/lib/cothink/types";

interface FinalPromptProps {
  prompt: string;
  meta: FinalPromptMeta;
  onReset: () => void;
  onSaveBrief?: () => Promise<void>;
  isStorageEnabled?: boolean;
}

export function FinalPrompt({
  prompt,
  meta,
  onReset,
  onSaveBrief,
  isStorageEnabled = false,
}: FinalPromptProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSaveBrief || saving) return;
    setSaving(true);
    try {
      await onSaveBrief();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-emerald-900">
              Final Prompt Ready
            </h2>
          </div>
          <p className="text-xs text-emerald-700 mt-0.5">
            Grounded in confirmed brief. Methods worded as advisory instructions.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-800/60 block">
            Final Score
          </span>
          <span className="text-lg font-black text-emerald-800">
            {meta.finalClarity}/100
          </span>
        </div>
      </div>

      {/* Metadata Badges */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Expert Role:</span>
          <span className="font-semibold text-slate-800">{meta.expertRole}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Provider:</span>
          <span className="font-mono text-slate-700">{meta.provider}</span>
        </div>
        <div className="pt-1 border-t border-slate-200">
          <span className="text-slate-500 font-medium block mb-1">
            Applied Methodologies:
          </span>
          <div className="flex flex-wrap gap-1">
            {meta.methods.map((method, i) => (
              <span
                key={i}
                className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-sm text-[11px] font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Box */}
      <div className="relative">
        <div className="flex justify-between items-center bg-slate-800 text-slate-200 px-3 py-2 rounded-t-xl text-xs font-semibold">
          <span>Prompt Preview</span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span>{copied ? "✓ Copied!" : "📋 Copy Prompt"}</span>
          </button>
        </div>
        <textarea
          readOnly
          value={prompt}
          rows={14}
          className="w-full font-mono text-xs text-slate-800 bg-slate-900/5 border border-slate-300 rounded-b-xl p-3 focus:outline-none resize-none leading-relaxed select-all"
        />
      </div>

      {/* Footer Actions */}
      <div className="pt-2 space-y-2">
        {onSaveBrief && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border flex items-center justify-center gap-1.5 ${
              saved
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
            }`}
          >
            <span>{saved ? "✓ Saved to Browser Storage!" : saving ? "Saving..." : "💾 Save Brief to Browser"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
        >
          ↻ Start New CoThink Session
        </button>
      </div>
    </div>
  );
}
