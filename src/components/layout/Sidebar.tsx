import React from 'react';
import {
  House,
  Building2,
  DoorOpen,
  CalendarCheck,
  Zap,
  Siren,
  ShieldCheck,
  BarChart3,
  Lightbulb,
  Bell,
  Wrench,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react';
import { AppPage, useAppState } from '../../store/AppStateContext.tsx';

export interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onCloseMobile }) => {
  const { activePage, setActivePage, logout, recommendations, kpis, bookingRequests } = useAppState();

  const handleNav = (page: AppPage) => {
    setActivePage(page);
    onCloseMobile?.();
  };

  const pendingBookingsCount = bookingRequests.filter((b) => b.status === 'PENDING').length;
  const criticalAlertsCount = kpis.activeAlertsCount;
  const actionableRecsCount = recommendations.filter(
    (r) => r.approvalStatus === 'PENDING REVIEW' && r.safetyStatus.eligible
  ).length;

  return (
    <aside
      className={`w-[240px] bg-[var(--bg-sidebar)] dark:bg-[#101012] border-r border-[var(--border)] dark:border-[#27272A] flex flex-col justify-between h-full select-none shrink-0 transition-colors ${className}`}
    >
      {/* Brand row */}
      <div className="h-[48px] px-4 flex items-center gap-2.5 border-b border-[var(--border)] dark:border-[#27272A]">
        {/* Logo: 24px rounded-6 blue square with white lightning glyph */}
        <div className="w-6 h-6 rounded-[6px] bg-[#3478D4] flex items-center justify-center text-white shrink-0 shadow-xs">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-semibold text-[15px] tracking-[0.02em] text-[var(--text)]">
            ZHATKA
          </span>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
            v2.1
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* GROUP 1: GENERAL */}
        <div>
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            General
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleNav('overview')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'overview'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <House className="w-4 h-4 stroke-[1.5]" />
                <span>Home</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('buildings')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'buildings'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 stroke-[1.5]" />
                <span>Buildings</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('rooms')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'rooms'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 stroke-[1.5]" />
                <span>Rooms</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('bookings')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'bookings'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 stroke-[1.5]" />
                <span>Bookings</span>
              </div>
              {pendingBookingsCount > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full font-bold">
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('monitoring')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'monitoring'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 stroke-[1.5]" />
                <span>Energy Monitoring</span>
              </div>
            </button>
          </div>
        </div>

        {/* GROUP 2: CORE DECISION ENGINE */}
        <div>
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Core Engine
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleNav('planner')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'planner'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Siren className="w-4 h-4 stroke-[1.5] text-red-500" />
                <span className="font-semibold text-red-600 dark:text-red-400">Emergency Planner</span>
              </div>
              <span className="text-[10px] font-mono bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1 py-0.2 rounded font-bold">
                P0-P3
              </span>
            </button>

            <button
              onClick={() => handleNav('data-integrity')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'data-integrity'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 stroke-[1.5] text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Data Integrity</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1 py-0.2 rounded font-bold">
                7-Stg
              </span>
            </button>

            <button
              onClick={() => handleNav('analytics')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'analytics'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 stroke-[1.5]" />
                <span>Analytics & Reports</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('intelligence')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'intelligence'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 stroke-[1.5]" />
                <span>ZHATKA Intelligence</span>
              </div>
              {actionableRecsCount > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-[var(--blue)] text-white rounded-full font-bold">
                  {actionableRecsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* GROUP 3: OPERATIONS */}
        <div>
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Operations
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => handleNav('notifications')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'notifications'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 stroke-[1.5]" />
                <span>Notifications</span>
              </div>
              {criticalAlertsCount > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full font-bold">
                  {criticalAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('maintenance')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'maintenance'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 stroke-[1.5]" />
                <span>Maintenance</span>
              </div>
            </button>

            <button
              onClick={() => handleNav('audit')}
              className={`w-full h-[32px] px-2 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
                activePage === 'audit'
                  ? 'bg-[var(--blue-light)] text-[var(--blue-text)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
              }`}
            >
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 stroke-[1.5]" />
                <span>Activity Logs</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* COMBINED SETTINGS & PROFILE TAB (Requirement 9) */}
      <div className="p-3 border-t border-[var(--border)] dark:border-[#27272A] space-y-1">
        <button
          onClick={() => handleNav('settings')}
          className={`w-full h-[36px] px-2.5 rounded-[8px] text-[13px] font-medium flex items-center justify-between transition-colors ${
            activePage === 'settings' || activePage === 'profile'
              ? 'bg-[var(--blue-light)] text-[var(--blue-text)] font-semibold shadow-xs'
              : 'text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 stroke-[1.5]" />
            <span>Settings & Profile</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[var(--bg)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] text-[var(--text-secondary)]">
            Admin
          </span>
        </button>

        <button
          onClick={logout}
          className="w-full h-[32px] px-2.5 rounded-[8px] text-[13px] font-medium flex items-center gap-2 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4 stroke-[1.5]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
