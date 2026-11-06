import React, { useState } from 'react';
import {
  Settings,
  UserRound,
  RotateCcw,
  Sliders,
  Shield,
  Info,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon,
  Plus,
  Trash2,
  Edit2,
  Save,
  Lock,
  Zap,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.tsx';
import { CONFIG } from '../config/defaults.ts';
import { EmergencyScenarioPreset } from '../types/index.ts';

export const SettingsProfile: React.FC = () => {
  const {
    currentUser,
    resetDemo,
    showToast,
    theme,
    toggleTheme,
    customScenarios,
    saveCustomScenario,
    deleteCustomScenario,
    updateScenarioInputs,
    setActivePage,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'profile' | 'scenarios' | 'thresholds' | 'appearance' | 'system'>('profile');
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Configurable thresholds
  const [freshness, setFreshness] = useState(CONFIG.freshnessMinutes);
  const [highRatio, setHighRatio] = useState(CONFIG.highRatio);
  const [emptyMinKw, setEmptyMinKw] = useState(CONFIG.emptyExcessMinKw);
  const [windowHours, setWindowHours] = useState(CONFIG.verificationWindowHours);
  const [residualKw, setResidualKw] = useState(CONFIG.simulatedResidualKw);

  // Scenario editor form modal
  const [editingScenario, setEditingScenario] = useState<EmergencyScenarioPreset | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Simulation rule thresholds updated.', 'success');
  };

  const handleSaveScenarioForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScenario) return;
    saveCustomScenario(editingScenario);
    setEditingScenario(null);
  };

  const openNewScenario = () => {
    setEditingScenario({
      id: `custom-sc-${Date.now()}`,
      name: 'New Custom Grid Contingency',
      description: 'Custom emergency operational response parameters.',
      baselineDemandKw: 100,
      multiplier: 3.0,
      capacityPercent: 50,
      emergencyDurationHours: 2,
      isCustom: true,
    });
  };

  const activateScenario = (sc: EmergencyScenarioPreset) => {
    updateScenarioInputs({
      baselineDemandKw: sc.baselineDemandKw,
      multiplier: sc.multiplier,
      capacityPercent: sc.capacityPercent,
      emergencyDurationHours: sc.emergencyDurationHours,
    });
    setActivePage('planner');
    showToast(`Scenario "${sc.name}" loaded into Emergency Planner.`, 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        icon={Settings}
        title="Settings & Governance"
        tag="SIMULATED"
        description="Unified administration console: profile credentials, emergency scenario configuration, rule thresholds, and theme customization (MASTER §24)."
        tabs={[
          { id: 'profile', label: 'Admin Profile' },
          { id: 'scenarios', label: 'Emergency Scenarios' },
          { id: 'thresholds', label: 'Rule Thresholds' },
          { id: 'appearance', label: 'Appearance & Theme' },
          { id: 'system', label: 'System & Reset' },
        ]}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as any)}
      />

      {/* 1. ADMIN PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* User Persona Profile Card */}
          <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-6 space-y-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--blue-light)] text-[var(--blue-text)] flex items-center justify-center font-mono font-bold text-[20px] shadow-xs">
                AD
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[var(--text)]">
                    {currentUser?.name || 'Campus Energy Administrator'}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active Session
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-mono">
                  {currentUser?.email || 'admin@srmist.edu.in'} · Role: {currentUser?.role || 'Administrator (simulated)'}
                </p>
                <div className="text-xs text-[var(--text-secondary)]">
                  Designated Control Room Engineer · Full RBAC Approval Authority
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border)] dark:border-[#27272A] text-xs">
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Campus Facility</span>
                <div className="font-semibold text-[var(--text)] mt-0.5">
                  {currentUser?.campus || 'SRMIST Main Campus'}
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Access Level</span>
                <div className="font-semibold text-[var(--blue-text)] mt-0.5">
                  Tier-1 Super Administrator
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Authentication Type</span>
                <div className="font-semibold text-[var(--text)] mt-0.5 font-mono">
                  Demo Session (Simulated)
                </div>
              </div>
            </div>
          </div>

          {/* Prototype Boundaries & Legal Disclaimers (MASTER §24) */}
          <div className="p-4 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] space-y-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-semibold text-[var(--text)]">
              <Shield className="w-4 h-4 text-[var(--blue-text)]" />
              <span>Safety Engine Guardrails & Human-in-the-Loop Governance</span>
            </div>
            <p className="leading-relaxed">
              ZHATKA operates under a strict Human-in-the-Loop paradigm. No automated shutoff or load shedding action can execute without explicit cryptographic signature or affirmative approval from an authenticated administrator. Safety engine invariants unconditionally forbid shed of life-safety loads, server cores, or rooms with active occupied telemetry.
            </p>
          </div>
        </div>
      )}

      {/* 2. EMERGENCY SCENARIOS MANAGER TAB (Requirement 4) */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">
                Operational Emergency Scenarios
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Customize, update, and manage contingency profiles to test sudden grid drops or demand surges.
              </p>
            </div>
            <button
              onClick={openNewScenario}
              className="h-8 px-3 rounded-lg bg-[var(--blue)] hover:bg-[var(--blue-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Scenario</span>
            </button>
          </div>

          <div className="space-y-3">
            {customScenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-xl border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg)] dark:bg-[#121214] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--text)]">{sc.name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-[var(--blue-light)] text-[var(--blue-text)]">
                      {sc.multiplier}x Demand / {sc.capacityPercent}% Pool
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {sc.description}
                  </p>
                  <div className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-3 pt-1">
                    <span>Baseline: {sc.baselineDemandKw} kW</span>
                    <span>Duration: {sc.emergencyDurationHours}h</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingScenario(sc)}
                    className="p-1.5 text-xs rounded-lg border border-[var(--border)] dark:border-[#27272A] hover:bg-[var(--bg-hover)] text-[var(--text)]"
                    title="Edit scenario parameters"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCustomScenario(sc.id)}
                    className="p-1.5 text-xs rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                    title="Delete custom scenario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => activateScenario(sc)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--blue)] hover:bg-[var(--blue-hover)] text-white shadow-xs transition-colors"
                  >
                    Load in Planner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RULE THRESHOLDS TAB */}
      {activeTab === 'thresholds' && (
        <form onSubmit={handleSaveSettings} className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-4 transition-colors">
          <div className="border-b border-[var(--border)] dark:border-[#27272A] pb-3">
            <h3 className="text-[14px] font-semibold text-[var(--text)]">
              Rule Engine Thresholds (MASTER §7 & §14)
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Adjustable parameters governing occupancy resolution and anomaly detection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--text)] mb-1">
                Sensor Reading Freshness Window (minutes)
              </label>
              <input
                type="number"
                value={freshness}
                onChange={(e) => setFreshness(Number(e.target.value))}
                className="w-full h-[34px] px-3 font-mono text-[13px] border border-[var(--border)] dark:border-[#27272A] rounded-[8px] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
              />
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                Readings older than this threshold trigger STALE_DATA and UNKNOWN status.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text)] mb-1">
                High Usage Ratio (multiple of baseline)
              </label>
              <input
                type="number"
                step="0.1"
                value={highRatio}
                onChange={(e) => setHighRatio(Number(e.target.value))}
                className="w-full h-[34px] px-3 font-mono text-[13px] border border-[var(--border)] dark:border-[#27272A] rounded-[8px] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
              />
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                Triggers HIGH_USAGE inspection flag when power exceeds baseline by this ratio.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text)] mb-1">
                Empty Room Excess Threshold (kW)
              </label>
              <input
                type="number"
                step="0.1"
                value={emptyMinKw}
                onChange={(e) => setEmptyMinKw(Number(e.target.value))}
                className="w-full h-[34px] px-3 font-mono text-[13px] border border-[var(--border)] dark:border-[#27272A] rounded-[8px] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
              />
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                Triggers EMPTY_BUT_CONSUMING when room verified empty draws above idle.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text)] mb-1">
                Simulated Residual Load After Curtailment (kW)
              </label>
              <input
                type="number"
                step="0.1"
                value={residualKw}
                onChange={(e) => setResidualKw(Number(e.target.value))}
                className="w-full h-[34px] px-3 font-mono text-[13px] border border-[var(--border)] dark:border-[#27272A] rounded-[8px] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
              />
              <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                Residual power after simulated shutdown (MASTER §11.2, default +0.3 kW).
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="h-[34px] px-4 rounded-[8px] bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)] text-[13px] font-semibold transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}

      {/* 4. APPEARANCE & THEME TAB (Requirement 3 & 5) */}
      {activeTab === 'appearance' && (
        <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-6 space-y-5 transition-colors">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Color Theme & Contrast Modes
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Switch between Institutional Clean Light and AMOLED Black themes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Theme Card */}
            <div
              onClick={() => {
                if (theme === 'dark') toggleTheme();
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                theme === 'light'
                  ? 'border-[var(--blue)] bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-1 ring-[var(--blue)]'
                  : 'border-[var(--border)] dark:border-[#27272A] hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-sm text-[var(--text)]">Institutional Light</span>
                </div>
                {theme === 'light' && (
                  <CheckCircle className="w-4 h-4 text-[var(--blue)]" />
                )}
              </div>
              <div className="p-3 bg-white dark:bg-[#18181B] rounded-lg border border-slate-200 dark:border-[#27272A] text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">High-legibility daytime palette</div>
                <div>Off-white surfaces (#F7F7F5) with crisp contrast lines (#E8E8E6).</div>
              </div>
            </div>

            {/* Dark Theme Card */}
            <div
              onClick={() => {
                if (theme === 'light') toggleTheme();
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'border-[#38BDF8] bg-black shadow-sm ring-1 ring-[#38BDF8]'
                  : 'border-[var(--border)] dark:border-[#27272A] hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-sky-400" />
                  <span className="font-semibold text-sm text-slate-900 dark:text-[#F4F4F6]">AMOLED Black & Subtle Grey</span>
                </div>
                {theme === 'dark' && (
                  <CheckCircle className="w-4 h-4 text-[#38BDF8]" />
                )}
              </div>
              <div className="p-3 bg-black rounded-lg border border-[#27272A] text-xs text-zinc-300 space-y-1">
                <div className="font-semibold text-sky-400">Operations Control Center</div>
                <div>True pure black (#000000) backdrop with elevated subtle grey blocks (#121214) and crisp contrast.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SYSTEM & RESET TAB */}
      {activeTab === 'system' && (
        <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-6 space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Simulation State Reset & Audit
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Reset entire simulated state to seed baseline or export audit records.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="font-semibold text-sm text-red-800 dark:text-red-300">
                Pristine Demonstration Seed Reset
              </div>
              <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Restores rooms, loads, bookings, equipment protections, and rule configs. Requires confirmation keyword.
              </div>
            </div>
            <button
              onClick={() => setIsResetOpen(true)}
              className="h-8 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulation State</span>
            </button>
          </div>
        </div>
      )}

      {/* Scenario Editor Dialog */}
      {editingScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-[var(--text)]">
              Edit Emergency Scenario
            </h3>

            <form onSubmit={handleSaveScenarioForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Scenario Name:</label>
                <input
                  type="text"
                  required
                  value={editingScenario.name}
                  onChange={(e) => setEditingScenario({ ...editingScenario, name: e.target.value })}
                  className="w-full h-8 px-2 rounded-md border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={editingScenario.description}
                  onChange={(e) => setEditingScenario({ ...editingScenario, description: e.target.value })}
                  className="w-full p-2 rounded-md border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Demand Multiplier (x):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingScenario.multiplier}
                    onChange={(e) => setEditingScenario({ ...editingScenario, multiplier: Number(e.target.value) || 1.0 })}
                    className="w-full h-8 px-2 font-mono rounded-md border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Available Capacity (%):</label>
                  <input
                    type="number"
                    step="5"
                    value={editingScenario.capacityPercent}
                    onChange={(e) => setEditingScenario({ ...editingScenario, capacityPercent: Number(e.target.value) || 50 })}
                    className="w-full h-8 px-2 font-mono rounded-md border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)] dark:border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setEditingScenario(null)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] dark:border-[#27272A] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)] font-semibold shadow-xs"
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetOpen}
        title="Reset Entire Simulation State"
        description="This will restore all rooms, loads, bookings, equipment protections, and rule parameters to the seed dataset. All local modifications will be cleared."
        confirmLabel="Reset Demo"
        requireResetKeyword={true}
        isDestructive={true}
        onConfirm={resetDemo}
        onClose={() => setIsResetOpen(false)}
      />
    </div>
  );
};
