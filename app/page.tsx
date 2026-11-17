"use client";

import React, { useState } from "react";
import { Chat } from "@/components/Chat";
import { ClarityMeter } from "@/components/ClarityMeter";
import { FinalPrompt } from "@/components/FinalPrompt";
import { ProviderBadge } from "@/components/ProviderBadge";
import { SummaryEditor } from "@/components/SummaryEditor";
import { useCoThink } from "@/hooks/useCoThink";

export default function Home() {
  const {
    session,
    loading,
    error,
    finalResult,
    start,
    answer,
    correct,
    generateNow,
    editSummary,
    confirmAndGenerateFinal,
    reset,
  } = useCoThink();

  const [initialInput, setInitialInput] = useState("");

  const handleStart = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const intent = preset || initialInput;
    if (!intent.trim() || loading) return;
    await start(intent.trim());
  };

  const handleConfirmAndGenerate = async (edits?: any) => {
    await confirmAndGenerateFinal(edits);
  };

  const currentStage = session?.stage || "intake";

  return (
    <div className="min-h-screen bg-slate-100/70 py-0 sm:py-6 flex flex-col justify-center">
      <main className="w-full max-w-[440px] mx-auto min-h-screen sm:min-h-[720px] bg-white sm:rounded-2xl sm:shadow-lg sm:border sm:border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">
                CoThink
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                Module
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Future AI Keyboard Co-Thinker
            </p>
          </div>
          <ProviderBadge provider={session?.providerName} />
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-50 border-b border-rose-200 p-2.5 px-3.5 text-xs text-rose-800 flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        {/* Main Body Content */}
        <div className="p-3.5 flex-1 flex flex-col overflow-y-auto">
          {/* Stage 1: Intake / Empty State */}
          {(!session || currentStage === "intake") && (
            <div className="my-auto space-y-5 py-6">
              <div className="space-y-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-xl text-indigo-600 mb-2">
                  💡
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  What are you trying to do?
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Type your raw thought or idea. An expert co-thinker will challenge your assumptions and help clarify your intent.
                </p>
              </div>

              <form onSubmit={(e) => handleStart(e)} className="space-y-2">
                <textarea
                  value={initialInput}
                  onChange={(e) => setInitialInput(e.target.value)}
                  disabled={loading}
                  rows={3}
                  placeholder="e.g. I want to build a budgeting app..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !initialInput.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{loading ? "Analyzing..." : "Start CoThinking →"}</span>
                </button>
              </form>

              {/* Starter Presets */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider text-center">
                  Or test with a sample prompt:
                </span>
                <div className="space-y-1.5">
                  {[
                    "I want to build a budgeting app.",
                    "I want to write a technical blog post on distributed consensus.",
                    "I want to prepare for a VP of Engineering interview.",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInitialInput(preset);
                        handleStart(undefined, preset);
                      }}
                      disabled={loading}
                      className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition-colors cursor-pointer"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: Interview Dialogue with Live Clarity Score */}
          {session && currentStage === "interview" && (
            <div className="flex-1 flex flex-col">
              <ClarityMeter clarity={session.clarity} pinned />
              <Chat
                turns={session.turns}
                expertRole={session.brief.expert?.role}
                loading={loading}
                onAnswer={answer}
                onCorrect={correct}
                onGenerateNow={generateNow}
              />
            </div>
          )}

          {/* Stage 3: Summary Editor */}
          {session && currentStage === "summary" && (
            <SummaryEditor
              brief={session.brief}
              clarity={session.clarity}
              loading={loading}
              onUpdate={editSummary}
              onConfirm={handleConfirmAndGenerate}
            />
          )}

          {/* Stage 4: Confirmed / Final Prompt */}
          {session && (currentStage === "confirmed" || currentStage === "final") && finalResult && (
            <FinalPrompt
              prompt={finalResult.prompt}
              meta={finalResult.meta}
              onReset={reset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
