import React, { useState } from "react";
import { ClarityScore, Dimension } from "@/lib/cothink/types";

interface ClarityMeterProps {
  clarity?: ClarityScore;
  pinned?: boolean;
}

export function ClarityMeter({ clarity, pinned = false }: ClarityMeterProps) {
  const [showDetail, setShowDetail] = useState(false);

  if (!clarity) return null;

  const { total, delta, dimensions, targetDimension } = clarity;

  const dimensionList: Dimension[] = [
    "goal",
    "audience",
    "problem",
    "evidence",
    "constraints",
    "risk",
  ];

  const getStatusBadge = (status: "covered" | "partial" | "missing") => {
    switch (status) {
      case "covered":
        return {
          bg: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
          dot: "bg-emerald-400",
          icon: "✓",
        };
      case "partial":
        return {
          bg: "bg-amber-950/60 text-amber-300 border-amber-500/30",
          dot: "bg-amber-400",
          icon: "½",
        };
      case "missing":
      default:
        return {
          bg: "bg-purple-950/40 text-purple-300/60 border-purple-500/20",
          dot: "bg-purple-500/40",
          icon: "○",
        };
    }
  };

  return (
    <div
      className={`border rounded-2xl bg-[#1b1333]/90 border-purple-500/20 backdrop-blur-md shadow-lg p-3 transition-all duration-200 ${
        pinned ? "sticky top-0 z-20 mb-3 border-purple-500/30" : ""
      }`}
    >
      {/* Header Row: Score & Delta */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setShowDetail(!showDetail)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
            Clarity Score
          </span>
          {delta !== undefined && delta !== 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                delta > 0
                  ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-900/60 text-rose-300 border border-rose-500/30"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black text-white tracking-tight">
            {total}
          </span>
          <span className="text-xs text-purple-300/60 font-medium">/ 100</span>
          <span className="text-[10px] text-purple-400 ml-1">
            {showDetail ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Progress Bar with Glowing Gradient */}
      <div className="w-full bg-[#110b24] rounded-full h-2 mt-2 overflow-hidden border border-white/5">
        <div
          className="h-2 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400"
          style={{ width: `${Math.min(100, Math.max(3, total))}%` }}
        />
      </div>

      {/* Target Dimension Indicator */}
      {targetDimension && (
        <div className="mt-2 text-[10px] text-purple-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>
            Probing: <strong className="text-white uppercase font-bold">{targetDimension}</strong>
          </span>
        </div>
      )}

      {/* Collapsible Detail Grid */}
      {showDetail && (
        <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {dimensionList.map((dim) => {
              const info = dimensions[dim];
              const badge = getStatusBadge(info.status);
              const isTarget = targetDimension === dim;

              return (
                <div
                  key={dim}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-colors ${
                    isTarget
                      ? "border-purple-400/50 bg-[#291b4a]"
                      : "border-purple-500/15 bg-[#140d28]/70"
                  }`}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                    <span className="capitalize font-medium text-slate-200 truncate">
                      {dim}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {info.score}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded-sm border uppercase font-bold ${badge.bg}`}
                    >
                      {badge.icon}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
