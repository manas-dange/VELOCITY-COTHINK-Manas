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
    <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-3 text-xs space-y-3">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">
            📁 Saved Briefs & Autocomplete
          </span>
          {consent && briefs.length > 0 && (
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {briefs.length}
            </span>
          )}
        </div>

        {/* Consent Switch */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <span className="text-[11px] text-slate-500">
            {consent ? "Active" : "Off"}
          </span>
          <div
            onClick={() => onToggleConsent(!consent)}
            className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              consent ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
            }`}
          >
            <div className="bg-white w-3 h-3 rounded-full shadow-xs transform" />
          </div>
        </label>
      </div>

      <p className="text-[11px] text-slate-500 leading-tight">
        Stores confirmed briefs in your browser&apos;s localStorage for ghost-text autocomplete. Zero server storage.
      </p>

      {/* Expanded Controls when Consent is Active */}
      {consent && (
        <div className="space-y-2 pt-1 border-t border-slate-200">
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onLoadDemoData}
              className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
            >
              ⚡ Load Demo Data (6 briefs)
            </button>

            {briefs.length > 0 && (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-[11px] text-slate-600 hover:text-slate-800 font-medium underline cursor-pointer"
              >
                {isOpen ? "Hide List ▲" : `View Briefs (${briefs.length}) ▼`}
              </button>
            )}
          </div>

          {/* List of Briefs */}
          {isOpen && briefs.length > 0 && (
            <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {briefs.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-lg p-2 flex items-start justify-between gap-2 shadow-2xs"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectBrief?.(b.goal)}
                    title="Click to copy into intake box"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {b.goal}
                      </span>
                      {b.isSyntheticSeed && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded-sm uppercase">
                          demo
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {b.expertRole} • Clarity: {b.finalClarity}/100
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteBrief(b.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded-sm cursor-pointer"
                    title="Delete brief"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Delete All Option */}
              <div className="pt-2 flex justify-end">
                {confirmDeleteAll ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-rose-600">Delete all {briefs.length} briefs?</span>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAll(false)}
                      className="text-[10px] text-slate-500 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onDeleteAll();
                        setConfirmDeleteAll(false);
                      }}
                      className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-sm font-bold"
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(true)}
                    className="text-[10px] text-rose-500 hover:text-rose-700 underline cursor-pointer"
                  >
                    Delete All
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
