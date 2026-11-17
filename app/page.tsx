"use client";

import React, { useEffect, useState } from "react";
import { Chat } from "@/components/Chat";
import { ClarityMeter } from "@/components/ClarityMeter";
import { FinalPrompt } from "@/components/FinalPrompt";
import { Mascot } from "@/components/Mascot";
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
  const [showSavedBriefs, setShowSavedBriefs] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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

  const starterCards = [
    {
      icon: "✦",
      iconColor: "text-purple-300",
      label: "Ask me anything",
      prompt: "I want to build a budgeting app.",
    },
    {
      icon: "❤️",
      iconColor: "text-rose-400",
      label: "How can I help?",
      prompt: "I want to write a technical blog post on distributed consensus.",
    },
    {
      icon: "⚡",
      iconColor: "text-amber-400",
      label: "Let's chat",
      prompt: "I want to prepare for a VP of Engineering interview.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07050e] flex flex-col justify-center items-center p-0 sm:p-4 text-slate-100">
      {/* Mobile Frame Container matching Screenshot */}
      <main className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[844px] bg-[#120c24] sm:rounded-[44px] sm:border-[9px] sm:border-[#201838] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(124,58,237,0.18)] flex flex-col overflow-hidden relative">
        {/* Top Radial Glow */}
        <div
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none opacity-60"
          style={{
            background: "radial-gradient(circle at 50% 0%, #3e2168 0%, #1c1236 50%, transparent 100%)",
          }}
        />

        {/* iPhone Status Bar */}
        <div className="pt-3 px-6 flex items-center justify-between text-xs text-slate-300 select-none z-10 shrink-0">
          <span className="font-semibold text-xs tracking-tight">9:41</span>
          {/* Dynamic Island Pill */}
          <div className="w-24 h-4.5 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 text-xs">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
            </svg>
            <div className="w-4 h-2.5 border border-slate-300 rounded-xs p-0.2 flex items-center">
              <div className="w-2.5 h-1.5 bg-slate-300 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* App Bar Navigation */}
        <header className="px-4 py-2.5 flex items-center justify-between z-10 shrink-0">
          {/* Left Action Button (Back or Info) */}
          <button
            type="button"
            onClick={() => {
              if (currentStage !== "intake") {
                reset();
              }
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white/80 transition-all cursor-pointer"
            title={currentStage !== "intake" ? "Back to start" : "CoThink"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Center Title */}
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
              <span>CoThink</span>
              <span className="text-[10px] text-purple-300 font-normal">AI</span>
            </h1>
            <ProviderBadge provider={session?.providerName} />
          </div>

          {/* Right Action Button (Saved Briefs Toggle) */}
          <button
            type="button"
            onClick={() => setShowSavedBriefs(!showSavedBriefs)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 flex items-center justify-center text-white/80 transition-all cursor-pointer"
            title="Saved Briefs & History"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-950/80 border-b border-rose-500/30 p-2 px-4 text-xs text-rose-200 flex items-center justify-between z-20">
            <span>{error}</span>
          </div>
        )}

        {/* Slide-out / Modal for Saved Briefs Panel */}
        {showSavedBriefs && (
          <div className="absolute inset-x-0 top-16 bottom-0 bg-[#0e091e]/95 backdrop-blur-md z-30 p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
              <span className="font-bold text-sm text-white">Saved Briefs & Storage</span>
              <button
                type="button"
                onClick={() => setShowSavedBriefs(false)}
                className="text-xs text-purple-300 hover:text-white px-2 py-1"
              >
                Done ✕
              </button>
            </div>
            <SavedBriefsPanel
              consent={consent}
              briefs={savedBriefs}
              onToggleConsent={toggleConsent}
              onDeleteBrief={deleteBrief}
              onDeleteAll={deleteAll}
              onLoadDemoData={loadDemoData}
              onSelectBrief={(goal) => {
                setInitialInput(goal);
                setShowSavedBriefs(false);
              }}
            />
          </div>
        )}

        {/* Main Scrollable Viewport */}
        <div className="flex-1 flex flex-col px-4 pb-4 overflow-y-auto z-10 min-h-0">
          {/* STAGE 1: Intake / Empty State (Matching Left Screen in Screenshot) */}
          {(!session || currentStage === "intake") && (
            <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
              <div className="space-y-4">
                {/* Cute Mascot Creature */}
                <Mascot greeting="Hi CoThinker" />

                {/* Heading */}
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Start a Conversation!
                  </h2>
                  <p className="text-xs text-[#a397bf] max-w-xs mx-auto leading-relaxed">
                    Your AI thinking partner is here to chat, sharpen, and clarify your intent!
                  </p>
                </div>

                {/* Vertical Starter Prompt Cards matching Screenshot */}
                <div className="space-y-2 pt-1">
                  {starterCards.map((card, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setInitialInput(card.prompt);
                        handleStart(undefined, card.prompt);
                      }}
                      disabled={loading}
                      className="w-full bg-[#1c1435]/90 hover:bg-[#281d4a] active:scale-[0.99] border border-white/5 hover:border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all shadow-md group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-base ${card.iconColor}`}>{card.icon}</span>
                        <div>
                          <span className="text-xs font-semibold text-slate-100 block">
                            {card.label}
                          </span>
                          <span className="text-[11px] text-[#9184ab] line-clamp-1">
                            &quot;{card.prompt}&quot;
                          </span>
                        </div>
                      </div>
                      <span className="text-purple-400/50 group-hover:text-purple-300 text-xs">→</span>
                    </button>
                  ))}
                </div>

                {/* Ghost-Text Suggestion Banner if typing */}
                {suggestion && (
                  <div className="text-xs text-purple-200 bg-[#241842] border border-purple-500/30 rounded-xl p-2.5 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="font-bold text-purple-300 shrink-0">💡 Suggestion:</span>
                      <span className="text-purple-100 truncate">{suggestion.fullSuggestion}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInitialInput(suggestion.fullSuggestion);
                        setSuggestion(null);
                      }}
                      className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-md text-[10px] font-bold shrink-0 shadow-sm cursor-pointer"
                    >
                      [Tab]
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Floating Input Bar for Intake Screen */}
              <form
                onSubmit={(e) => handleStart(e)}
                className="bg-[#1b1333] border border-white/10 rounded-full p-1 pl-3.5 flex items-center gap-2 shadow-2xl backdrop-blur-md mt-auto"
              >
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-purple-300 text-xs shrink-0 select-none">
                  ✦
                </div>

                <input
                  type="text"
                  value={initialInput}
                  onChange={(e) => setInitialInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="Type your message"
                  className="flex-1 bg-transparent text-white placeholder-[#786b96] text-sm focus:outline-none py-1.5 min-w-0"
                />

                <button
                  type="submit"
                  disabled={loading || !initialInput.trim()}
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
          )}

          {/* STAGE 2: Interview Dialogue with Live Clarity Score (Matching Right Screen in Screenshot) */}
          {session && currentStage === "interview" && (
            <div className="flex-1 flex flex-col h-full min-h-0">
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

          {/* STAGE 3: Summary Editor */}
          {session && currentStage === "summary" && (
            <SummaryEditor
              brief={session.brief}
              clarity={session.clarity}
              loading={loading}
              onUpdate={editSummary}
              onConfirm={handleConfirmAndGenerate}
            />
          )}

          {/* STAGE 4: Confirmed / Final Prompt */}
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
