import React, { useState } from "react";
import { Turn } from "@/lib/cothink/types";

interface ChatProps {
  turns: Turn[];
  expertRole?: string;
  loading: boolean;
  onAnswer: (text: string) => Promise<any>;
  onCorrect: (turnId: string, newAnswer: string) => Promise<any>;
  onGenerateNow: () => Promise<any>;
}

export function Chat({
  turns,
  expertRole = "Strategic Advisor",
  loading,
  onAnswer,
  onCorrect,
  onGenerateNow,
}: ChatProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || loading) return;
    const text = currentInput;
    setCurrentInput("");
    await onAnswer(text);
  };

  const handleStartEdit = (turn: Turn) => {
    setEditingTurnId(turn.id);
    setEditText(turn.answer || "");
  };

  const handleSaveEdit = async (turnId: string) => {
    if (!editText.trim() || loading) return;
    await onCorrect(turnId, editText);
    setEditingTurnId(null);
  };

  return (
    <div className="flex flex-col flex-1 pb-4">
      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 mb-4">
        {turns.map((turn, index) => (
          <div key={turn.id} className="space-y-3">
            {/* Assistant Question */}
            <div className="flex flex-col items-start max-w-[92%]">
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                  {index === 0 ? "Initial Prompt" : expertRole}
                </span>
                {turn.targetDimension && index > 0 && (
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    Probing: {turn.targetDimension.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="bg-slate-100 border border-slate-200/80 text-slate-800 text-sm rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm leading-relaxed">
                {turn.question}
              </div>
              {turn.rationale && (
                <div className="text-[11px] text-slate-400 mt-1 px-1 italic">
                  {turn.rationale}
                </div>
              )}

              {/* Quick-reply Answer Chips (Choice A: 1-Tap Direct Submission) */}
              {!turn.answer && turn.suggestedOptions && turn.suggestedOptions.length > 0 && !loading && (
                <div className="space-y-1.5 pt-2 w-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    ⚡ Quick Options (tap to submit):
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {turn.suggestedOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onAnswer(opt)}
                        disabled={loading}
                        className="text-left text-xs text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/70 hover:border-indigo-300 rounded-xl px-3 py-2 transition-colors font-medium cursor-pointer flex items-center justify-between group shadow-xs"
                      >
                        <span className="leading-snug">{opt}</span>
                        <span className="text-indigo-400 group-hover:text-indigo-600 text-[10px] font-bold shrink-0 ml-2">
                          Send →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Answer (if answered) */}
            {turn.answer !== undefined && (
              <div className="flex flex-col items-end ml-auto max-w-[92%]">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[11px] font-semibold text-slate-400">
                    You
                  </span>
                  {editingTurnId !== turn.id && !loading && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(turn)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingTurnId === turn.id ? (
                  <div className="w-full bg-white border-2 border-indigo-500 rounded-xl p-2.5 shadow-sm space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full text-sm text-slate-800 focus:outline-hidden resize-none"
                      placeholder="Correct your response..."
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingTurnId(null)}
                        disabled={loading}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(turn.id)}
                        disabled={loading || !editText.trim()}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-sm disabled:opacity-50"
                      >
                        {loading ? "Updating..." : "Save Correction"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-indigo-600 text-white text-sm rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm leading-relaxed">
                    {turn.answer}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic py-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span>Analyzing intent and calibrating next question...</span>
          </div>
        )}
      </div>

      {/* Answer Input & Actions */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-2 border-t border-slate-100 space-y-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={loading}
            placeholder="Type your response..."
            className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={loading || !currentInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-sm flex items-center justify-center min-w-[70px]"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs px-1">
          <span className="text-slate-400">
            One adaptive question at a time
          </span>
          <button
            type="button"
            onClick={onGenerateNow}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <span>⚡ Generate now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
