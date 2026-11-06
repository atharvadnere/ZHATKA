import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  RotateCcw,
  Menu,
  Shield,
  Siren,
  Sliders,
  FileSpreadsheet,
  CheckCircle,
  Sun,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import { useAppState } from '../../store/AppStateContext.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

export interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu, onOpenSearch }) => {
  const {
    currentUser,
    logout,
    activeScenarioId,
    loadScenario,
    resetDemo,
    recommendations,
    kpis,
    setActivePage,
    theme,
    toggleTheme,
    setAlertPopupOpen,
  } = useAppState();

  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const scenarioRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scenarioRef.current && !scenarioRef.current.contains(e.target as Node)) {
        setScenariosOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const latestAlerts = recommendations.slice(0, 5);

  return (
    <>
      <header className="h-[48px] bg-[var(--bg)] border-b border-[var(--border)] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30 dark:bg-black dark:border-[#27272A] transition-colors">
        {/* Left: Mobile hamburger + Search ⌘K */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text)] p-1 rounded-md"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 h-[32px] px-2.5 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border)] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)] dark:bg-[#18181B] dark:border-[#27272A] transition-colors w-[180px] sm:w-[240px]"
          >
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span className="truncate">Search rooms, loads...</span>
            <kbd className="ml-auto font-mono text-[10px] text-[var(--text-secondary)] bg-[var(--bg)] dark:bg-[#121214] px-1.5 py-0.5 rounded border border-[var(--border)] dark:border-[#27272A]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Campus Selector */}
          <div className="hidden lg:flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] dark:bg-[#18181B] px-2.5 py-1 rounded-[6px] border border-[var(--border)] dark:border-[#27272A]">
            <span className="w-2 h-2 rounded-full bg-[#2F9E5B]" />
            <span>SRMIST Demo Campus (simulated)</span>
          </div>

          {/* Alert Pop-up Modal Launcher */}
          <button
            onClick={() => setAlertPopupOpen(true)}
            className="h-[32px] px-2.5 rounded-[8px] border border-red-300 dark:border-red-900/60 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 text-red-700 dark:text-red-300 text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Open real-time alert pop-up center"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
            <span className="hidden sm:inline">Alert Center</span>
            {kpis.activeAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {kpis.activeAlertsCount}
              </span>
            )}
          </button>

          {/* Demo Scenarios Menu (MASTER.md §18) */}
          <div className="relative" ref={scenarioRef}>
            <button
              onClick={() => setScenariosOpen(!scenariosOpen)}
              className="h-[32px] px-2.5 rounded-[8px] border border-[var(--blue)]/30 bg-[var(--blue-light)] text-[var(--blue-text)] text-[12px] font-semibold flex items-center gap-1.5 hover:opacity-90 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Scenarios</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {scenariosOpen && (
              <div className="absolute right-0 mt-1.5 w-[310px] bg-[var(--bg)] dark:bg-[#18181B] rounded-[10px] border border-[var(--border)] dark:border-[#27272A] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border)] dark:border-[#27272A] mb-1">
                  5 Test Scenarios (MASTER §18)
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      loadScenario(1);
                      setScenariosOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-[6px] text-[12px] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors flex items-start gap-2 ${
                      activeScenarioId === 'scenario-1' ? 'bg-[var(--blue-light)] text-[var(--blue-text)]' : 'text-[var(--text)]'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-[#2F9E5B] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Scenario 1: Normal Campus</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">Demand 31.3 kW, avoidable 6.0 kW, seed baseline.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loadScenario(2);
                      setScenariosOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-[6px] text-[12px] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors flex items-start gap-2 ${
                      activeScenarioId === 'scenario-2' ? 'bg-[#FCE4E4] text-[#B42318] dark:bg-red-950/60 dark:text-red-300' : 'text-[var(--text)]'
                    }`}
                  >
                    <Siren className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Scenario 2: Emergency Demand Surge</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">3× demand (300 kW), 50% capacity (50 kW). Severe.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loadScenario(3);
                      setScenariosOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-[6px] text-[12px] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors flex items-start gap-2 ${
                      activeScenarioId === 'scenario-3' ? 'bg-[#EEE7FA] text-[#5B3FA8] dark:bg-purple-950/60 dark:text-purple-300' : 'text-[var(--text)]'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-[#8B6FD0] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Scenario 3: Critical Equipment Shield</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">Attach EQ-002 server to A-102. Shutdown held.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loadScenario(4);
                      setScenariosOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-[6px] text-[12px] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors flex items-start gap-2 ${
                      activeScenarioId === 'scenario-4' ? 'bg-[#FFF1D6] text-[#8A5A00] dark:bg-amber-950/60 dark:text-amber-300' : 'text-[var(--text)]'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#E0A03A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Scenario 4: Malicious & Invalid Data</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">7-stage validation pipeline on hostile test cases.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      loadScenario(5);
                      setScenariosOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-[6px] text-[12px] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors flex items-start gap-2 ${
                      activeScenarioId === 'scenario-5' ? 'bg-[#DDF3E4] text-[#1E6B3A] dark:bg-emerald-950/60 dark:text-emerald-300' : 'text-[var(--text)]'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-[#1E6B3A] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Scenario 5: Approval & Verification</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">Approve A-102 shutdown, apply, verify 8.8 kWh.</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors border border-transparent hover:border-[var(--border)] dark:hover:border-[#27272A]"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {kpis.activeAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D92D20]" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-1.5 w-[320px] bg-[var(--bg)] dark:bg-[#18181B] rounded-[10px] border border-[var(--border)] dark:border-[#27272A] shadow-xl p-2 z-50 animate-in fade-in duration-100">
                <div className="px-2 py-1 flex items-center justify-between border-b border-[var(--border)] dark:border-[#27272A] mb-1">
                  <span className="text-[12px] font-semibold text-[var(--text)]">
                    Notifications & Alerts
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {kpis.activeAlertsCount} active
                  </span>
                </div>

                <div className="divide-y divide-[var(--border)] dark:divide-[#27272A] max-h-[260px] overflow-y-auto">
                  {latestAlerts.length > 0 ? (
                    latestAlerts.map((rec) => (
                      <div
                        key={rec.recommendationId}
                        onClick={() => {
                          setAlertPopupOpen(true);
                          setNotificationsOpen(false);
                        }}
                        className="p-2 hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] cursor-pointer rounded-[6px] transition-colors text-left"
                      >
                        <div className="text-[12px] font-medium text-[var(--text)] truncate">
                          {rec.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                          {rec.reason}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[12px] text-[var(--text-secondary)]">
                      No active alerts. All rooms operating normally.
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--border)] dark:border-[#27272A] pt-1 mt-1 text-center">
                  <button
                    onClick={() => {
                      setAlertPopupOpen(true);
                      setNotificationsOpen(false);
                    }}
                    className="text-[12px] font-medium text-[var(--blue-text)] hover:underline"
                  >
                    Open Alert Center
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={() => setIsResetDialogOpen(true)}
            className="h-[32px] px-2.5 rounded-[8px] border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text-secondary)] hover:text-[#B42318] hover:border-[#D92D20]/40 text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            title="Reset simulation state to pristine seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset demo</span>
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 h-[32px] px-2 rounded-[8px] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors text-[var(--text)]"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--blue-light)] text-[var(--blue-text)] font-semibold text-[11px] flex items-center justify-center font-mono">
                AD
              </div>
              <span className="hidden md:inline text-[13px] font-medium">Admin</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-[200px] bg-[var(--bg)] dark:bg-[#18181B] rounded-[10px] border border-[var(--border)] dark:border-[#27272A] shadow-xl p-1 z-50">
                <div className="px-3 py-2 border-b border-[var(--border)] dark:border-[#27272A]">
                  <div className="text-[12px] font-semibold text-[var(--text)]">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">
                    {currentUser?.email || 'admin@srmist.edu.in'}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] rounded-[6px]"
                  >
                    Settings & Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsResetDialogOpen(true);
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-[#B42318] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[6px]"
                  >
                    Reset Demo (RESET)
                  </button>
                </div>

                <div className="border-t border-[var(--border)] dark:border-[#27272A] pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] rounded-[6px]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetDialogOpen}
        title="Reset Simulation Demo State"
        description="This will restore all rooms, loads, equipment, and settings to the pristine seeded demonstration baseline. All local modifications, simulated control states, and uploaded telemetry will be cleared."
        confirmLabel="Reset Demo"
        requireResetKeyword={true}
        isDestructive={true}
        onConfirm={resetDemo}
        onClose={() => setIsResetDialogOpen(false)}
      />
    </>
  );
};
