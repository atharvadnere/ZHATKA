import React from 'react';
import { ShieldCheck, AlertTriangle, Siren, Flame } from 'lucide-react';
import { SeverityLevel } from '../../types/index.ts';

export interface SeverityBannerProps {
  severity: SeverityLevel;
  supplyRatio: number;
  availableKw: number;
  demandKw: number;
  deficitKw: number;
  className?: string;
}

export const SeverityBanner: React.FC<SeverityBannerProps> = ({
  severity,
  supplyRatio,
  availableKw,
  demandKw,
  deficitKw,
  className = '',
}) => {
  if (severity === 'NORMAL') {
    return (
      <div className={`p-4 rounded-[10px] bg-[#DDF3E4] border border-[#2F9E5B]/40 text-[#1E6B3A] flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[#1E6B3A]" />
          <div>
            <div className="font-semibold text-[14px]">NORMAL OPERATING CONDITION</div>
            <div className="text-[13px] text-[#1E6B3A]/90">
              Supply satisfies 100% of demand ({availableKw} kW capacity available for {demandKw} kW demand).
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-[14px] font-semibold tabular-nums">
            {(supplyRatio * 100).toFixed(1)}% Supplied
          </span>
        </div>
      </div>
    );
  }

  if (severity === 'CAUTION') {
    return (
      <div className={`p-4 rounded-[10px] bg-[#FFF1D6] border border-[#E0A03A]/40 text-[#8A5A00] flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#8A5A00]" />
          <div>
            <div className="font-semibold text-[14px]">CAUTION: PEAK GRID STRESS</div>
            <div className="text-[13px] text-[#8A5A00]/90">
              Demand nearing available reserve pool. Deficit: {deficitKw} kW.
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-[14px] font-semibold tabular-nums">
            {(supplyRatio * 100).toFixed(1)}% Supplied
          </span>
        </div>
      </div>
    );
  }

  if (severity === 'SHORTAGE') {
    return (
      <div className={`p-4 rounded-[10px] bg-[#FFF1D6] border-l-4 border-l-[#D92D20] border border-[#E0A03A]/40 text-[#8A5A00] flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 shrink-0 text-[#B42318]" />
          <div>
            <div className="font-semibold text-[14px] text-[#B42318]">SHORTAGE: ACTIVE LOAD PRIORITISATION REQUIRED</div>
            <div className="text-[13px]">
              Available capacity ({availableKw} kW) supplies {(supplyRatio * 100).toFixed(1)}% of campus load ({demandKw} kW). Deficit: {deficitKw} kW.
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-[14px] font-bold text-[#B42318] tabular-nums">
            {(supplyRatio * 100).toFixed(1)}% Supplied
          </span>
        </div>
      </div>
    );
  }

  // SEVERE RESOURCE EMERGENCY
  return (
    <div className={`p-4 rounded-[10px] bg-[#FCE4E4] border-l-4 border-l-[#D92D20] border border-[#D92D20]/40 text-[#B42318] flex items-center justify-between gap-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <Siren className="w-6 h-6 shrink-0 text-[#D92D20] animate-pulse" />
        <div>
          <div className="font-bold text-[15px] tracking-wide text-[#B42318] flex items-center gap-2">
            <span>SEVERE RESOURCE EMERGENCY</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-[#B42318] text-white rounded-[4px] uppercase">
              Hackathon Constraint 1 Active
            </span>
          </div>
          <div className="text-[13px] text-[#B42318]/90 mt-0.5">
            Demand escalated to {demandKw} kW (3× surge) while available pool is constrained to {availableKw} kW (50% drop). Deficit: {deficitKw} kW.
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 pl-2">
        <div className="font-mono text-[18px] font-bold text-[#B42318] tabular-nums">
          {(supplyRatio * 100).toFixed(2)}%
        </div>
        <div className="text-[11px] uppercase tracking-wider text-[#B42318]/80 font-medium">
          Supply Share
        </div>
      </div>
    </div>
  );
};
