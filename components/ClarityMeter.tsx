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
          bg: "bg-emerald-50 text-emerald-700 border-emerald-300",
          dot: "bg-emerald-500",
          icon: "✓",
        };
      case "partial":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-300",
          dot: "bg-amber-500",
          icon: "½",
        };
      case "missing":
      default:
        return {
          bg: "bg-slate-50 text-slate-500 border-slate-200",
          dot: "bg-slate-300",
          icon: "○",
        };
    }
  };

  return (
    <div
      className={`border rounded-xl bg-white shadow-sm p-3 transition-all duration-200 ${
        pinned ? "sticky top-0 z-20 mb-3 border-indigo-100 bg-white/95 backdrop-blur-sm" : ""
      }`}
    >
      {/* Header Row: Score & Delta */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setShowDetail(!showDetail)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Clarity Score
          </span>
          {delta !== undefined && delta !== 0 && (
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-sm ${
                delta > 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black text-slate-800 tracking-tight">
            {total}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
          <span className="text-xs text-slate-400 ml-1">
            {showDetail ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${
            total >= 70
              ? "bg-emerald-500"
              : total >= 40
              ? "bg-indigo-500"
              : "bg-amber-500"
          }`}
          style={{ width: `${Math.min(100, Math.max(2, total))}%` }}
        />
      </div>

      {/* Dimension Chips */}
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {dimensionList.map((dim) => {
          const info = dimensions[dim];
          if (!info) return null;
          const badge = getStatusBadge(info.status);
          const isTarget = targetDimension === dim && info.status !== "covered";

          return (
            <span
              key={dim}
              onClick={() => setShowDetail(true)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer ${
                badge.bg
              } ${isTarget ? "ring-2 ring-indigo-400 ring-offset-1 font-semibold" : ""}`}
              title={`${dim.toUpperCase()}: ${info.status} (${info.score}/${info.weight})`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              <span className="capitalize">{dim}</span>
              <span className="text-[10px] opacity-75">{badge.icon}</span>
            </span>
          );
        })}
      </div>

      {/* Expandable Explanation Breakdown */}
      {showDetail && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div className="font-semibold text-slate-700 flex justify-between">
            <span>Deterministic Scoring Breakdown</span>
            <span className="text-[10px] text-slate-400 font-normal">
              Click header to collapse
            </span>
          </div>
          {dimensionList.map((dim) => {
            const info = dimensions[dim];
            if (!info) return null;
            return (
              <div
                key={dim}
                className="flex items-start justify-between py-1 border-b border-slate-50 last:border-b-0"
              >
                <div>
                  <span className="font-semibold text-slate-800 capitalize">
                    {dim}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{info.reason}</p>
                </div>
                <div className="text-right whitespace-nowrap ml-2">
                  <span className="font-mono font-medium text-slate-700">
                    {info.score} / {info.weight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
