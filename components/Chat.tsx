import React, { useState } from "react";
import { Turn } from "@/lib/cothink/types";
import { MascotAvatar } from "./Mascot";

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

  // Find latest pending turn with suggestions
  const latestPendingTurn = turns.length > 0 && !turns[turns.length - 1].answer ? turns[turns.length - 1] : null;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
        {turns.map((turn, index) => (
          <div key={turn.id} className="space-y-3">
            {/* Assistant Question Bubble */}
            <div className="flex items-start gap-2 max-w-[90%]">
              <MascotAvatar className="w-8 h-8 mt-1" />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                    {index === 0 ? "Initial Prompt" : expertRole}
                  </span>
                  {turn.targetDimension && index > 0 && (
                    <span className="text-[9px] font-semibold text-purple-200/70 bg-purple-900/40 border border-purple-500/20 px-1.5 py-0.5 rounded-full">
                      {turn.targetDimension}
                    </span>
                  )}
                </div>

                <div className="bg-[#241a3e] border border-white/5 text-slate-100 text-sm rounded-2xl rounded-tl-sm px-4 py-3 shadow-md leading-relaxed">
                  {turn.question}
                </div>

                {turn.rationale && (
                  <div className="text-[11px] text-purple-300/60 mt-1 px-1 italic">
                    {turn.rationale}
                  </div>
                )}
              </div>
            </div>

            {/* User Answer Bubble (if answered) */}
            {turn.answer !== undefined && (
              <div className="flex items-start justify-end gap-2 ml-auto max-w-[90%]">
                <div className="flex flex-col items-end w-full">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      You
                    </span>
                    {editingTurnId !== turn.id && !loading && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(turn)}
                        className="text-[10px] text-purple-300 hover:text-purple-100 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editingTurnId === turn.id ? (
                    <div className="w-full bg-[#1e1533] border border-purple-500/40 rounded-2xl p-3 shadow-lg space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="w-full text-sm text-slate-100 bg-transparent focus:outline-none resize-none placeholder-slate-500"
                        placeholder="Correct your response..."
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/20">
                        <button
                          type="button"
                          onClick={() => setEditingTurnId(null)}
                          disabled={loading}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(turn.id)}
                          disabled={loading || !editText.trim()}
                          className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md disabled:opacity-50"
                        >
                          {loading ? "Updating..." : "Save Correction"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#362555] border border-purple-400/20 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md leading-relaxed">
                      {turn.answer}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                <div className="w-7 h-7 rounded-full bg-slate-700/80 border border-white/20 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0 mt-1 select-none">
                  U
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-300/80 italic py-2 pl-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Analyzing intent and calibrating next question...</span>
          </div>
        )}
      </div>

      {/* Floating Bottom Section: Quick Chips + Input Pill Bar */}
      <div className="pt-2 space-y-2">
        {/* Suggestion Chips (Horizontal Scrolling like in Screenshot) */}
        {latestPendingTurn && latestPendingTurn.suggestedOptions && latestPendingTurn.suggestedOptions.length > 0 && !loading && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
            {latestPendingTurn.suggestedOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAnswer(opt)}
                disabled={loading}
                className="bg-[#21163b]/90 hover:bg-[#2d1e4e] active:scale-95 text-[#c7b9e8] text-xs font-medium px-3.5 py-1.5 rounded-full border border-purple-500/20 whitespace-nowrap transition-all shadow-sm flex items-center gap-1 shrink-0"
              >
                <span>{opt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Floating Input Pill matching Screenshot */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1b1333] border border-white/10 rounded-full p-1 pl-3 flex items-center gap-2 shadow-2xl backdrop-blur-md"
        >
          <button
            type="button"
            onClick={onGenerateNow}
            disabled={loading}
            title="Generate now with labelled unknowns"
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-purple-300 flex items-center justify-center text-xs transition-colors shrink-0"
          >
            ⚡
          </button>

          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={loading}
            placeholder="Type your message"
            className="flex-1 bg-transparent text-white placeholder-[#786b96] text-sm focus:outline-none py-1.5 min-w-0"
          />

          <button
            type="submit"
            disabled={loading || !currentInput.trim()}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <svg
              className="w-4 h-4 transform rotate-45 -translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
