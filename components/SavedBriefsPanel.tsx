import React, { useState } from "react";
import { SavedBrief } from "@/lib/cothink";

interface SavedBriefsPanelProps {
  consent: boolean;
  briefs: SavedBrief[];
  onToggleConsent: (enabled: boolean) => void;
  onDeleteBrief: (id: string) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onLoadDemoData: () => Promise<void>;
  onSelectBrief?: (goal: string) => void;
}

export function SavedBriefsPanel({
  consent,
  briefs,
  onToggleConsent,
  onDeleteBrief,
  onDeleteAll,
  onLoadDemoData,
  onSelectBrief,
}: SavedBriefsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  return (
    <div className="border border-purple-500/20 rounded-2xl bg-[#17102e]/80 p-3 text-xs space-y-2.5 backdrop-blur-sm">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">
            📁 Saved Briefs & Autocomplete
          </span>
          {consent && briefs.length > 0 && (
            <span className="bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {briefs.length}
            </span>
          )}
        </div>

        {/* Consent Switch */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <span className="text-[11px] text-purple-300/70">
            {consent ? "Active" : "Off"}
          </span>
          <div
            onClick={() => onToggleConsent(!consent)}
            className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              consent ? "bg-purple-600 justify-end" : "bg-[#251b3f] justify-start border border-white/10"
            }`}
          >
            <div className="bg-white w-3 h-3 rounded-full shadow-xs" />
          </div>
        </label>
      </div>

      <p className="text-[11px] text-purple-300/60 leading-tight">
        Stores confirmed briefs in your browser&apos;s localStorage for ghost-text autocomplete. Zero server storage.
      </p>

      {/* Expanded Controls when Consent is Active */}
      {consent && (
        <div className="space-y-2 pt-1 border-t border-purple-500/20">
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onLoadDemoData}
              className="text-[10px] font-semibold text-purple-300 bg-[#251944] hover:bg-[#32215c] border border-purple-500/30 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              ⚡ Load Demo Data (6 briefs)
            </button>

            {briefs.length > 0 && (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-[10px] text-purple-300/80 hover:text-purple-100 font-medium underline cursor-pointer"
              >
                {isOpen ? "Hide List ▲" : `View Briefs (${briefs.length}) ▼`}
              </button>
            )}
          </div>

          {/* List of Briefs */}
          {isOpen && briefs.length > 0 && (
            <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {briefs.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#120b26] border border-purple-500/20 rounded-xl p-2 flex items-start justify-between gap-2 shadow-xs"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectBrief?.(b.goal)}
                    title="Click to copy into intake box"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-slate-100 line-clamp-1">
                        {b.goal}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 py-0.2 rounded-xs">
                        {b.finalClarity}/100
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-300/60 flex items-center gap-2">
                      <span>{b.expertRole}</span>
                      <span>•</span>
                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteBrief(b.id)}
                    className="text-purple-400/50 hover:text-rose-400 text-xs px-1 cursor-pointer transition-colors"
                    title="Delete brief"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Danger Zone: Delete All */}
              <div className="pt-2 text-right">
                {confirmDeleteAll ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[10px] text-rose-400">
                      Delete all {briefs.length} briefs?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteAll();
                        setConfirmDeleteAll(false);
                      }}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                    >
                      Yes, Delete All
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAll(false)}
                      className="text-slate-400 hover:text-slate-200 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(true)}
                    className="text-[10px] text-rose-400/70 hover:text-rose-400 cursor-pointer"
                  >
                    Clear All Saved Briefs
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
