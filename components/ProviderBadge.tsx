import React from "react";

export function ProviderBadge({ provider }: { provider?: string }) {
  const isMock = !provider || provider.toLowerCase().includes("mock");

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs bg-slate-50 text-slate-700 border-slate-200">
      <span
        className={`w-2 h-2 rounded-full ${
          isMock ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
        }`}
      />
      <span>
        {isMock ? "Mock: deterministic, no real LLM" : provider}
      </span>
    </div>
  );
}
