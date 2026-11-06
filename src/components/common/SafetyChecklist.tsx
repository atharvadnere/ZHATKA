import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import { SafetyCheck } from '../../types/index.ts';

export interface SafetyChecklistProps {
  checks: SafetyCheck[];
  className?: string;
}

export const SafetyChecklist: React.FC<SafetyChecklistProps> = ({ checks, className = '' }) => {
  let firstFailFound = false;

  return (
    <div className={`space-y-2 ${className}`}>
      {checks.map((check, idx) => {
        const isFail = check.status === 'FAIL';
        const isPass = check.status === 'PASS';
        const isOutlinedFail = isFail && !firstFailFound;
        if (isFail) firstFailFound = true;

        return (
          <div
            key={check.id || idx}
            className={`p-2.5 rounded-[8px] border transition-colors ${
              isOutlinedFail
                ? 'bg-[#FCE4E4]/40 border-[#D92D20] ring-1 ring-[#D92D20]'
                : isFail
                ? 'bg-[#FCE4E4]/20 border-[#E8E8E6]'
                : isPass
                ? 'bg-white border-[#E8E8E6]'
                : 'bg-[#F7F7F5] border-dashed border-[#D4D4D1]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                {isPass ? (
                  <div className="w-4 h-4 rounded-full bg-[#DDF3E4] text-[#1E6B3A] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                ) : isFail ? (
                  <div className="w-4 h-4 rounded-full bg-[#FCE4E4] text-[#B42318] flex items-center justify-center">
                    <X className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#F1F1EF] text-[#A3A3A0] flex items-center justify-center">
                    <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-[#202124]">
                    {check.label}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                      isPass
                        ? 'text-[#1E6B3A] bg-[#DDF3E4]'
                        : isFail
                        ? 'text-[#B42318] bg-[#FCE4E4]'
                        : 'text-[#A3A3A0] bg-[#F1F1EF]'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#737373] mt-0.5 leading-[16px]">
                  {check.detail}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
