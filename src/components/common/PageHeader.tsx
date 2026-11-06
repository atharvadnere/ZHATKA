import React from 'react';
import { LucideIcon } from 'lucide-react';
import { DataNature, DataNatureTag } from './DataNatureTag.tsx';

export interface PageTab {
  id: string;
  label: string;
  count?: number;
}

export interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  tag?: DataNature;
  description: string;
  tabs?: PageTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  tag,
  description,
  tabs,
  activeTab,
  onTabChange,
  actions,
}) => {
  return (
    <div className="border-b border-[#E8E8E6] pb-0 mb-6">
      {/* Row 1: Icon + Title + Tag */}
      <div className="flex items-center gap-2.5 mb-1">
        <Icon className="w-5 h-5 text-[#3478D4] shrink-0" />
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#202124] tracking-tight">
          {title}
        </h1>
        {tag && <DataNatureTag nature={tag} />}
      </div>

      {/* Row 2: Description */}
      <p className="text-[13px] leading-[18px] text-[#737373] mb-4">
        {description}
      </p>

      {/* Row 3: Tabs & Actions */}
      {(tabs || actions) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {tabs && (
            <div className="flex items-center gap-6 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`h-[40px] text-[14px] font-medium flex items-center gap-1.5 border-b-2 transition-colors relative whitespace-nowrap px-1 ${
                      isActive
                        ? 'border-[#3478D4] text-[#1F5FB0]'
                        : 'border-transparent text-[#737373] hover:text-[#202124]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="text-[12px] px-1.5 py-0.2 rounded-full bg-[#F1F1EF] text-[#737373] tabular-nums font-mono">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {actions && <div className="flex items-center gap-2 pb-2 shrink-0">{actions}</div>}
        </div>
      )}
    </div>
  );
};
