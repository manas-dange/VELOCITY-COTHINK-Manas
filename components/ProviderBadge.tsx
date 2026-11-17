import React from "react";

export function ProviderBadge({ provider }: { provider?: string }) {
  const isMock = !provider || provider.toLowerCase().includes("mock");

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border shadow-sm bg-[#1c1433]/80 text-purple-200 border-purple-500/20 backdrop-blur-xs">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isMock ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
        }`}
      />
      <span>
        {isMock ? "Mock Mode" : provider}
      </span>
    </div>
  );
}
