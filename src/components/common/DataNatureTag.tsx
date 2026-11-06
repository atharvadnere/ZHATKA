import React from 'react';

export type DataNature = 'SIMULATED' | 'POTENTIAL' | 'ESTIMATED' | 'MEASURED (SIMULATED)' | 'PROJECTED';

export interface DataNatureTagProps {
  nature: DataNature;
  className?: string;
}

export const DataNatureTag: React.FC<DataNatureTagProps> = ({ nature, className = '' }) => {
  let styleClasses = 'bg-transparent text-[#737373] border border-[#D4D4D1]';
  let title = 'Demonstration data. Not from real campus systems.';

  if (nature === 'POTENTIAL') {
    styleClasses = 'bg-[#FFF1D6] text-[#8A5A00] border border-[#E0A03A]/30';
    title = 'Possible avoidable load. Not verified.';
  } else if (nature === 'ESTIMATED') {
    styleClasses = 'bg-[#EAF2FC] text-[#1F5FB0] border border-[#3478D4]/30';
    title = 'Calculated from stated assumptions.';
  } else if (nature === 'MEASURED (SIMULATED)') {
    styleClasses = 'bg-[#DDF3E4] text-[#1E6B3A] border border-[#2F9E5B]/40';
    title = 'From simulated post-action readings.';
  } else if (nature === 'PROJECTED') {
    styleClasses = 'bg-[#EEE7FA] text-[#5B3FA8] border border-dashed border-[#8B6FD0]';
    title = 'Rule-based projection, not a measurement.';
  }

  return (
    <span
      title={title}
      className={`inline-block font-mono text-[11px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-[4px] cursor-help whitespace-nowrap select-none ${styleClasses} ${className}`}
    >
      {nature}
    </span>
  );
};
