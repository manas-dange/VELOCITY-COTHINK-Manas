"use client";

import React, { useEffect, useState } from "react";
import { Chat } from "@/components/Chat";
import { ClarityMeter } from "@/components/ClarityMeter";
import { FinalPrompt } from "@/components/FinalPrompt";
import { ProviderBadge } from "@/components/ProviderBadge";
import { SavedBriefsPanel } from "@/components/SavedBriefsPanel";
import { SummaryEditor } from "@/components/SummaryEditor";
import { useCoThink } from "@/hooks/useCoThink";
import { useSavedBriefs } from "@/hooks/useSavedBriefs";
import { getGhostSuggestion, SuggestionResult } from "@/lib/cothink";

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

  const {
    consent,
    briefs: savedBriefs,
    toggleConsent,
    saveBrief,
    deleteBrief,
    deleteAll,
    loadDemoData,
  } = useSavedBriefs();

  const [initialInput, setInitialInput] = useState("");
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);

  // Debounced ghost-text suggestion matching
  useEffect(() => {
    if (!consent || !initialInput || initialInput.trim().length < 3) {
      setSuggestion(null);
      return;
    }

    const timer = setTimeout(() => {
      const match = getGhostSuggestion(initialInput, savedBriefs);
      setSuggestion(match);
    }, 150);

    return () => clearTimeout(timer);
  }, [initialInput, savedBriefs, consent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      setInitialInput(suggestion.fullSuggestion);
      setSuggestion(null);
    }
  };

  const handleStart = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const intent = preset || initialInput;
    if (!intent.trim() || loading) return;
    await start(intent.trim());
  };

  const handleConfirmAndGenerate = async (edits?: any) => {
    await confirmAndGenerateFinal(edits);
  };

  const handleSaveCurrentBrief = async () => {
    if (!session || !finalResult) return;
    await saveBrief({
      goal: session.brief.goal,
      context: session.brief.context.map((c) => c.text),
      constraints: session.brief.constraints.map((c) => c.text),
      expertRole: finalResult.meta.expertRole,
      finalPrompt: finalResult.prompt,
      finalClarity: finalResult.meta.finalClarity,
      keywords: [session.brief.expert?.role || "", ...session.brief.goal.toLowerCase().split(/\s+/)],
    });
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
            <div className="my-auto space-y-4 py-4">
              <div className="space-y-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-xl text-indigo-600 mb-1">
                  💡
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  What are you trying to do?
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Type your raw thought or idea. An expert co-thinker will challenge your assumptions and help clarify your intent.
                </p>
              </div>

              {/* Input Form with Ghost Text Autocomplete */}
              <form onSubmit={(e) => handleStart(e)} className="space-y-2">
                <div className="space-y-1">
                  <textarea
                    value={initialInput}
                    onChange={(e) => setInitialInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    rows={3}
                    placeholder="e.g. I want to build a budgeting app..."
                    className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm"
                    autoFocus
                  />

                  {/* Ghost-Text Suggestion Pill */}
                  {suggestion && (
                    <div className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg p-2 flex items-center justify-between animate-fade-in shadow-2xs">
                      <div className="flex items-center gap-1.5 truncate mr-2">
                        <span className="font-semibold text-indigo-700 shrink-0">💡 From saved briefs:</span>
                        <span className="text-slate-600 truncate">{suggestion.fullSuggestion}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setInitialInput(suggestion.fullSuggestion);
                          setSuggestion(null);
                        }}
                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-md text-[11px] font-bold shrink-0 shadow-2xs cursor-pointer"
                      >
                        Accept [Tab]
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !initialInput.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{loading ? "Analyzing..." : "Start CoThinking →"}</span>
                </button>
              </form>

              {/* Starter Presets */}
              <div className="pt-1">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider text-center">
                  Or test with a sample prompt:
                </span>
                <div className="space-y-1">
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
                      className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition-colors cursor-pointer"
                    >
                      &quot;{preset}&quot;
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Briefs & Autocomplete Panel */}
              <div className="pt-2">
                <SavedBriefsPanel
                  consent={consent}
                  briefs={savedBriefs}
                  onToggleConsent={toggleConsent}
                  onDeleteBrief={deleteBrief}
                  onDeleteAll={deleteAll}
                  onLoadDemoData={loadDemoData}
                  onSelectBrief={(goal) => setInitialInput(goal)}
                />
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
              onSaveBrief={handleSaveCurrentBrief}
              isStorageEnabled={consent}
            />
          )}
        </div>
      </main>
    </div>
  );
}
