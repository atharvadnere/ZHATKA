import React from 'react';
import { DataNature, DataNatureTag } from './DataNatureTag.tsx';

export interface StatCell {
  label: string;
  value: string | number;
  unit?: string;
  tag?: DataNature;
  caption?: string;
  captionColor?: string;
}

export interface StatStripProps {
  cells: StatCell[];
  className?: string;
}

export const StatStrip: React.FC<StatStripProps> = ({ cells, className = '' }) => {
  return (
    <div
      className={`bg-white border border-[#E8E8E6] rounded-[10px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${cells.length} divide-y sm:divide-y-0 sm:divide-x divide-[#E8E8E6] overflow-hidden ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`,
      }}
    >
      {cells.map((cell, idx) => (
        <div key={idx} className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[12px] font-medium text-[#737373] truncate" title={cell.label}>
              {cell.label}
            </span>
            {cell.tag && <DataNatureTag nature={cell.tag} />}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[28px] font-semibold text-[#202124] tabular-nums tracking-tight">
              {cell.value}
            </span>
            {cell.unit && (
              <span className="text-[14px] font-normal text-[#737373]">{cell.unit}</span>
            )}
          </div>
          {cell.caption && (
            <p className={`text-[12px] mt-1 truncate ${cell.captionColor || 'text-[#737373]'}`} title={cell.caption}>
              {cell.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
