import React from 'react';
import { AlertCircle } from 'lucide-react';

export const NoticeStrip: React.FC = () => {
  return (
    <aside aria-label="Simulation boundary" className="h-[28px] bg-[#F7F7F5] border-b border-[#E8E8E6] px-4 flex items-center justify-between text-[11px] font-medium text-[#737373] select-none shrink-0 z-40">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-[#B42318] bg-[#FCE4E4] px-1.5 py-0.2 rounded text-[10px] tracking-wider uppercase">
          SIMULATED DATA
        </span>
        <span className="truncate">
          Simulated prototype — no real campus data, no real control. PS6 &quot;The Sleeping Campus&quot;
        </span>
      </div>
      <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-[#737373]">
        <span>TZ: Asia/Kolkata</span>
        <span>·</span>
        <span>Model: Deterministic Rule Engine</span>
      </div>
    </aside>
  );
};
