import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

export interface EvidencePanelProps {
  evidence: Record<string, any>;
  title?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidence,
  title = 'Telemetry & Audit Evidence',
  defaultExpanded = false,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const keys = Object.keys(evidence || {});
  if (keys.length === 0) return null;

  return (
    <div className={`border border-[#E8E8E6] rounded-[8px] bg-[#F7F7F5] overflow-hidden ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left text-[12px] font-medium text-[#202124] hover:bg-[#F1F1EF] transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#737373]" />
          <span>{title}</span>
          <span className="font-mono text-[10px] text-[#737373]">({keys.length} data fields)</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
        )}
      </button>

      {expanded && (
        <div className="p-3 border-t border-[#E8E8E6] bg-white divide-y divide-[#F1F1EF] max-h-[240px] overflow-y-auto">
          {keys.map((k) => {
            const val = evidence[k];
            const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return (
              <div key={k} className="py-1.5 flex items-baseline justify-between gap-4 text-[12px]">
                <span className="text-[#737373] font-mono shrink-0">{k}</span>
                <span className="font-mono text-[#202124] text-right truncate tabular-nums font-medium" title={displayVal}>
                  {displayVal}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
