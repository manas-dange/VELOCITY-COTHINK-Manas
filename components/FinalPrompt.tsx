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
    <div className="space-y-4 pb-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-[#1b2520] border border-emerald-500/30 rounded-2xl p-3.5 flex items-start justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold text-emerald-200">
              Final Prompt Ready
            </h2>
          </div>
          <p className="text-xs text-emerald-400/80 mt-0.5">
            Grounded in confirmed brief. Methods applied as advisory instructions.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-400/60 block">
            Final Score
          </span>
          <span className="text-xl font-black text-emerald-300">
            {meta.finalClarity}/100
          </span>
        </div>
      </div>

      {/* Metadata Badges */}
      <div className="bg-[#1b1333]/90 border border-purple-500/20 rounded-2xl p-3.5 space-y-2 text-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-purple-300/70 font-medium">Expert Role:</span>
          <span className="font-semibold text-white">{meta.expertRole}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-purple-300/70 font-medium">Provider:</span>
          <span className="font-mono text-purple-200">{meta.provider}</span>
        </div>
        <div className="pt-2 border-t border-purple-500/20">
          <span className="text-purple-300/70 font-medium block mb-1.5">
            Applied Methodologies:
          </span>
          <div className="flex flex-wrap gap-1">
            {meta.methods.map((method, i) => (
              <span
                key={i}
                className="bg-purple-900/50 border border-purple-400/30 text-purple-200 px-2 py-0.5 rounded-full text-[10px] font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Box */}
      <div className="relative">
        <div className="flex items-center justify-between px-1 mb-1.5 text-xs text-slate-300">
          <span className="font-bold text-purple-200">Assembled Prompt:</span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-purple-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? (
              <span className="text-emerald-400 font-semibold">✓ Copied!</span>
            ) : (
              <span>📋 Copy to Clipboard</span>
            )}
          </button>
        </div>

        <pre className="bg-[#0e091e] border border-purple-500/30 rounded-2xl p-3.5 text-xs font-mono text-purple-100 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto shadow-inner select-all">
          {prompt}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{copied ? "✓ Copied to Clipboard!" : "Copy Final Prompt"}</span>
        </button>

        {isStorageEnabled && onSaveBrief && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saved || saving}
            className="w-full py-2.5 bg-[#21163b] hover:bg-[#2c1e4d] border border-purple-500/30 text-purple-200 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <span>{saved ? "✓ Saved to Browser Storage!" : saving ? "Saving..." : "📁 Save Brief to Browser"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="w-full py-2 text-xs text-purple-300/70 hover:text-purple-100 font-medium text-center transition-colors cursor-pointer"
        >
          ← Start New Thought
        </button>
      </div>
    </div>
  );
}
