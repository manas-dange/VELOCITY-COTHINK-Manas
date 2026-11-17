import React from "react";

export function Mascot({ greeting = "Hi CoThinker" }: { greeting?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center my-3 select-none">
      {/* Speech Bubble */}
      <div className="relative mb-2">
        <div className="bg-[#6b42db] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-purple-900/30">
          {greeting}
        </div>
        <div className="w-2 h-2 bg-[#6b42db] rotate-45 mx-auto -mt-1 shadow-xs" />
      </div>

      {/* Mascot Character */}
      <div className="relative w-24 h-20 flex items-center justify-center">
        {/* Ears */}
        <div className="absolute -top-1 left-2 w-7 h-7 bg-[#7c4deb] rounded-full" />
        <div className="absolute -top-1 right-2 w-7 h-7 bg-[#7c4deb] rounded-full" />

        {/* Body */}
        <div className="relative w-24 h-18 bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] rounded-[30px] flex flex-col items-center justify-center shadow-xl shadow-purple-950/60 border border-purple-400/20">
          {/* Eyes */}
          <div className="flex items-center gap-6 mt-1">
            <div className="w-2.5 h-1.5 border-b-2 border-slate-900/80 rounded-full" />
            <div className="w-2.5 h-1.5 border-b-2 border-slate-900/80 rounded-full" />
          </div>

          {/* Cheeks & Smile */}
          <div className="flex items-center justify-between w-14 mt-1">
            <div className="w-2 h-1 bg-pink-400/40 rounded-full" />
            <div className="w-2 h-1 border-b-2 border-slate-900/70 rounded-full" />
            <div className="w-2 h-1 bg-pink-400/40 rounded-full" />
          </div>

          {/* Cute Belly Detail */}
          <div className="w-6 h-3.5 border-b border-purple-300/30 rounded-full mt-1" />
        </div>
      </div>
    </div>
  );
}

export function MascotAvatar({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center shadow-md shadow-purple-900/40 border border-purple-400/30 text-white shrink-0 select-none`}>
      <span className="text-[11px] font-bold">✦</span>
    </div>
  );
}

