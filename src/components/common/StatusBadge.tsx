import React from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  HelpCircle,
  Shield,
  Wrench,
  TrendingUp,
  Power,
  PauseCircle,
  AlertOctagon,
  AlertTriangle,
  Info,
} from 'lucide-react';

export interface StatusBadgeProps {
  state: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state, className = '', size = 'md' }) => {
  const norm = (state || '').toUpperCase().trim();

  // OCCUPIED
  if (norm === 'OCCUPIED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#EAF2FC] text-[#1F5FB0] border border-[#3478D4]/20 ${className}`}>
        <Users className="w-3.5 h-3.5 shrink-0" />
        <span>Occupied</span>
      </span>
    );
  }

  // VERIFIED EMPTY
  if (norm === 'VERIFIED_EMPTY' || norm === 'EMPTY' || norm === 'VACANT') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F1F1EF] text-[#6B6B6B] border border-[#D4D4D1] ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>Verified Empty</span>
      </span>
    );
  }

  // RESERVED
  if (norm === 'RESERVED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#EDF0F5] text-[#4A5568] border border-[#CBD5E1] ${className}`}>
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span>Reserved</span>
      </span>
    );
  }

  // UNKNOWN (DESIGN.md §3.4: Hatched grey + dashed border + "?")
  if (norm === 'UNKNOWN') {
    return (
      <span className={`state-unknown inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium shadow-none ${className}`}>
        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[#6B6B6B]" />
        <span className="font-semibold">UNKNOWN (?)</span>
      </span>
    );
  }

  // PROTECTED
  if (norm === 'PROTECTED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#EEE7FA] text-[#5B3FA8] border border-[#8B6FD0]/30 ${className}`}>
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span>Protected</span>
      </span>
    );
  }

  // MAINTENANCE
  if (norm === 'MAINTENANCE') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#FFF1D6] text-[#8A5A00] border border-[#E0A03A]/40 ${className}`}>
        <Wrench className="w-3.5 h-3.5 shrink-0" />
        <span>Maintenance</span>
      </span>
    );
  }

  // HIGH USAGE
  if (norm === 'HIGH_USAGE') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#FFF1D6] text-[#8A5A00] border border-[#E0A03A]/40 ${className}`}>
        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
        <span>High Usage</span>
      </span>
    );
  }

  // EMPTY BUT CONSUMING
  if (norm === 'EMPTY_BUT_CONSUMING') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#FFF1D6] text-[#8A5A00] border border-[#E0A03A]/40 ${className}`}>
        <Power className="w-3.5 h-3.5 shrink-0" />
        <span>Empty But Consuming</span>
      </span>
    );
  }

  // HELD / SUPPRESSED
  if (norm === 'HOLD' || norm === 'HELD' || norm === 'SUPPRESS' || norm === 'SUPPRESSED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#FFF1D6] text-[#8A5A00] border border-[#E0A03A]/40 ${className}`}>
        <PauseCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{norm === 'SUPPRESS' || norm === 'SUPPRESSED' ? 'Suppressed' : 'Held'}</span>
      </span>
    );
  }

  // ELIGIBLE FOR REVIEW / FULL
  if (norm === 'ELIGIBLE_FOR_REVIEW' || norm === 'ELIGIBLE' || norm === 'FULL' || norm === 'APPROVED' || norm === 'VERIFIED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#DDF3E4] text-[#1E6B3A] border border-[#2F9E5B]/40 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{norm === 'FULL' ? 'Full Allocation' : norm === 'VERIFIED' ? 'Verified' : norm === 'APPROVED' ? 'Approved' : 'Eligible for Review'}</span>
      </span>
    );
  }

  // REDUCED / AT_MINIMUM
  if (norm === 'REDUCED' || norm === 'AT_MINIMUM') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#FFF1D6] text-[#8A5A00] border border-[#E0A03A]/40 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>{norm === 'AT_MINIMUM' ? 'At Safe Minimum' : 'Reduced Allocation'}</span>
      </span>
    );
  }

  // DEFERRED
  if (norm === 'DEFERRED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F1F1EF] text-[#6B6B6B] border border-[#A3A3A0] ${className}`}>
        <PauseCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Deferred (0 kW)</span>
      </span>
    );
  }

  // REJECTED / INFEASIBLE / CRITICAL
  if (norm === 'REJECTED' || norm === 'INFEASIBLE' || norm === 'CRITICAL' || norm === 'FAILED' || norm === 'NOT_ALLOCATED') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#FCE4E4] text-[#B42318] border border-[#D92D20]/40 ${className}`}>
        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
        <span>{norm === 'NOT_ALLOCATED' ? 'Not Allocated' : norm === 'INFEASIBLE' ? 'Infeasible' : norm === 'REJECTED' ? 'Rejected' : 'Critical'}</span>
      </span>
    );
  }

  // Default fallback
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[12px] font-medium bg-[#F1F1EF] text-[#737373] border border-[#E8E8E6] ${className}`}>
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>{state}</span>
    </span>
  );
};
