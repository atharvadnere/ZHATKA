import React, { useState } from 'react';
import {
  Siren,
  RotateCcw,
  Play,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Lock,
  Shield,
  HelpCircle,
  ArrowRight,
  Flame,
  Info,
  Sliders,
  Edit3,
  Plus,
  Save,
  CheckCircle2,
  Undo2,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatStrip } from '../components/common/StatStrip.tsx';
import { SeverityBanner } from '../components/common/SeverityBanner.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import { EmergencyScenarioPreset } from '../types/index.ts';

export const EmergencyPlanner: React.FC = () => {
  const {
    scenarioInputs,
    updateScenarioInputs,
    allocationPlan,
    runAllocation,
    approvePlan,
    rejectPlan,
    planApproved,
    updateLoadAllocation,
    resetLoadOverrides,
    customScenarios,
    saveCustomScenario,
  } = useAppState();

  const [adminComment, setAdminComment] = useState('');
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  // Scenario customizer form state
  const [scenarioForm, setScenarioForm] = useState<EmergencyScenarioPreset>({
    id: `custom-${Date.now()}`,
    name: 'Custom Campus Demand Contingency',
    description: 'Operational contingency scenario tailored to real-time grid constraints.',
    baselineDemandKw: scenarioInputs.baselineDemandKw || 100,
    multiplier: scenarioInputs.multiplier || 3.0,
    capacityPercent: scenarioInputs.capacityPercent || 50,
    emergencyDurationHours: scenarioInputs.emergencyDurationHours || 1,
    isCustom: true,
  });

  const {
    baselineDemandKw,
    multiplier,
    capacityPercent,
    originalCapacityKw,
    availableKw,
    currentDemandKw,
    deficitKw,
    supplyRatio,
    severity,
    feasible,
    loads,
    categoryTotals,
    conflictBreakdown,
    hasManualOverrides,
  } = allocationPlan;

  const handleApplyPreset = (preset: EmergencyScenarioPreset) => {
    updateScenarioInputs({
      baselineDemandKw: preset.baselineDemandKw,
      multiplier: preset.multiplier,
      capacityPercent: preset.capacityPercent,
      emergencyDurationHours: preset.emergencyDurationHours,
    });
    runAllocation();
  };

  const handleSaveAndApplyScenario = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomScenario(scenarioForm);
    handleApplyPreset(scenarioForm);
    setIsScenarioModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Page Header */}
      <PageHeader
        icon={Siren}
        title="Emergency Resource Planner & Dynamic Load Rationing"
        tag="SIMULATED"
        description="Dynamic load prioritisation, constraint-based rationing, and manual allocation adjustments during sudden campus electrical deficits (MASTER Module 3)."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScenarioModalOpen(true)}
              className="h-[32px] px-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] dark:border-[#383842] dark:bg-[#121214] text-[var(--text)] hover:bg-[var(--bg-hover)] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-[var(--blue-text)]" />
              <span>Configure Scenario</span>
            </button>
            <button
              onClick={() => {
                resetLoadOverrides();
                updateScenarioInputs({ baselineDemandKw: 100, multiplier: 3.0, capacityPercent: 50 });
                runAllocation();
              }}
              className="h-[32px] px-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] dark:border-[#383842] dark:bg-[#121214] text-[var(--text-secondary)] hover:text-red-600 text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
            <button
              onClick={runAllocation}
              className="h-[32px] px-3.5 rounded-[8px] bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Allocation</span>
            </button>
          </div>
        }
      />

      {/* 1. Scenario Controls & Quick Presets */}
      <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-[var(--border)] dark:border-[#27272A] pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--blue-text)]" />
              <span>Emergency Scenario Presets & What-If Controls</span>
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Simulate sudden grid capacity loss or extreme surges to trigger deterministic priority allocation.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                updateScenarioInputs({ capacityPercent: 40 });
              }}
              className="text-[11px] font-mono text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border dark:border-red-900 px-2.5 py-1 rounded-md transition-colors"
              title="Set available capacity to 40% (40 kW) to demonstrate NO FEASIBLE SAFE ALLOCATION"
            >
              Test Infeasible (40% Cap)
            </button>
            <button
              onClick={() => {
                updateScenarioInputs({ multiplier: 3.0, capacityPercent: 50, baselineDemandKw: 100 });
              }}
              className="text-[11px] font-mono text-[var(--blue-text)] bg-[var(--blue-light)] hover:opacity-90 px-2.5 py-1 rounded-md transition-colors font-semibold"
            >
              Default (3× / 50%)
            </button>
          </div>
        </div>

        {/* Quick Scenario Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[var(--text-secondary)] font-medium shrink-0">Quick Presets:</span>
          {customScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleApplyPreset(sc)}
              className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] text-[var(--text)] hover:border-[var(--blue)] shrink-0 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
              <span>{sc.name}</span>
              <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                ({sc.multiplier}x / {sc.capacityPercent}%)
              </span>
            </button>
          ))}
          <button
            onClick={() => setIsScenarioModalOpen(true)}
            className="px-2 py-1 rounded-md border border-dashed border-[var(--border)] dark:border-[#383842] text-[var(--blue-text)] hover:bg-[var(--bg-hover)] shrink-0 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Customize Scenario</span>
          </button>
        </div>

        {/* Interactive Sliders / Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Baseline Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-[var(--text)]">
                Baseline Campus Demand
              </label>
              <span className="font-mono text-[12px] font-semibold text-[var(--text)]">
                {baselineDemandKw} kW
              </span>
            </div>
            <input
              type="number"
              min="10"
              max="10000"
              step="5"
              value={baselineDemandKw}
              onChange={(e) => updateScenarioInputs({ baselineDemandKw: Number(e.target.value) || 100 })}
              className="w-full h-[36px] px-3 font-mono text-[13px] border border-[var(--border)] dark:border-[#383842] rounded-[8px] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--blue)]"
            />
            <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
              Reference initial campus load pool (default 100 kW)
            </span>
          </div>

          {/* Demand Multiplier Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-[var(--text)]">
                Surge Demand Multiplier
              </label>
              <span className="font-mono text-[12px] font-bold text-red-600 dark:text-red-400">
                {multiplier.toFixed(1)}× ({currentDemandKw.toFixed(1)} kW)
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={multiplier}
              onChange={(e) => updateScenarioInputs({ multiplier: Number(e.target.value) })}
              className="w-full h-2 bg-[var(--bg-secondary)] dark:bg-[#202024] rounded-lg appearance-none cursor-pointer accent-[var(--blue)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono mt-1">
              <span>1.0× (Normal)</span>
              <span className="font-bold text-red-600 dark:text-red-400">3.0× (Emergency)</span>
              <span>5.0× (Extreme)</span>
            </div>
          </div>

          {/* Available Capacity Percent Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-[var(--text)]">
                Available Capacity
              </label>
              <span className="font-mono text-[12px] font-bold text-[var(--blue-text)]">
                {capacityPercent}% ({availableKw.toFixed(1)} kW)
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={capacityPercent}
              onChange={(e) => updateScenarioInputs({ capacityPercent: Number(e.target.value) })}
              className="w-full h-2 bg-[var(--bg-secondary)] dark:bg-[#202024] rounded-lg appearance-none cursor-pointer accent-[var(--blue)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono mt-1">
              <span>20% (Crippled)</span>
              <span className="font-bold text-amber-600">50% (Standard)</span>
              <span>100% (Full Grid)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Severity Banner */}
      <SeverityBanner
        severity={severity}
        supplyRatio={supplyRatio}
        demandKw={currentDemandKw}
        availableKw={availableKw}
        deficitKw={deficitKw}
      />

      {/* Infeasible Invariant Alert Box */}
      {!feasible && (
        <div className="p-4 rounded-[10px] bg-red-100 border border-red-300 dark:bg-red-950/70 dark:border-red-900 text-red-900 dark:text-red-200 space-y-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <h4 className="font-bold text-[14px]">
              {allocationPlan.hasManualOverrides 
                ? 'EMERGENCY CAPACITY EXCEEDED (Manual Overrides Infeasible)'
                : 'NO FEASIBLE SAFE ALLOCATION (Safety Floor Breach)'}
            </h4>
          </div>
          <p className="text-[12px] leading-relaxed">
            {allocationPlan.hasManualOverrides
              ? `Total manually allocated load (${allocationPlan.allocatedTotalKw} kW) exceeds maximum available emergency generation capacity (${availableKw} kW) by ${(allocationPlan.allocatedTotalKw - availableKw).toFixed(1)} kW. Reduce allocations or defer non-critical loads to restore safety compliance.`
              : `Available electrical pool (${availableKw} kW) is strictly less than mandatory safe minimum operating floor (${allocationPlan.mandatoryTotalKw} kW). System refuses to shed life-safety, server core, or essential infrastructure.`}
          </p>
        </div>
      )}

      {/* 3. Live Campus Emergency Capacity Allocation Bar & Category Breakdown */}
      <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-5 transition-colors">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--blue)] animate-pulse" />
              <h3 className="text-[14px] font-semibold text-[var(--text)]">
                Campus Emergency Capacity Allocation Bar (Live Feedback)
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-[13px] tabular-nums">
              <span className="text-[var(--text-secondary)]">
                Requested: <strong className="text-[var(--text)]">{currentDemandKw.toFixed(1)} kW</strong>
              </span>
              <span className="text-[var(--text-secondary)]">·</span>
              <span className="text-[var(--text-secondary)]">
                Limit: <strong className="text-[var(--text)]">{availableKw.toFixed(1)} kW</strong>
              </span>
              <span className="text-[var(--text-secondary)]">·</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                allocationPlan.allocatedTotalKw > availableKw
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-900'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900'
              }`}>
                {allocationPlan.allocatedTotalKw.toFixed(1)} kW ({Math.round((allocationPlan.allocatedTotalKw / (availableKw || 1)) * 100)}%)
              </span>
            </div>
          </div>

          {/* Master Capacity Progress Bar */}
          {(() => {
            const cap = Math.max(0.1, availableKw);
            const alloc = allocationPlan.allocatedTotalKw;
            const filledPct = Math.min(100, (alloc / cap) * 100);
            const isExceeded = alloc > cap;
            const remainingMarginKw = Math.max(0, cap - alloc);
            const excessKw = Math.max(0, alloc - cap);

            return (
              <div className="space-y-1.5">
                <div className="relative w-full h-4 rounded-full bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] overflow-hidden">
                  {/* Allocated Bar Fill */}
                  <div
                    style={{ width: `${filledPct}%` }}
                    className={`h-full transition-all duration-300 ease-out ${
                      isExceeded
                        ? 'bg-red-500 dark:bg-red-600'
                        : filledPct > 85
                        ? 'bg-amber-500'
                        : 'bg-[var(--blue)] dark:bg-[#38BDF8]'
                    }`}
                  />
                  {/* 100% capacity marker line */}
                  <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-red-600 dark:bg-red-400 opacity-60" />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)] pt-0.5">
                  <span>0 kW</span>
                  <span>Safe Floor: {allocationPlan.mandatoryTotalKw.toFixed(1)} kW</span>
                  <span>50% ({ (availableKw * 0.5).toFixed(1) } kW)</span>
                  <span className={isExceeded ? 'font-bold text-red-600 dark:text-red-400' : ''}>
                    {isExceeded 
                      ? `⚠️ Exceeded by +${excessKw.toFixed(1)} kW!` 
                      : `Reserve Margin: ${remainingMarginKw.toFixed(1)} kW`}
                  </span>
                  <span className="font-semibold text-[var(--text)]">Max: {availableKw.toFixed(1)} kW</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Priority Category Breakdown Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[var(--border)] dark:border-[#27272A]">
          {/* P0 Category Bar */}
          {(() => {
            const p0 = categoryTotals.P0;
            const pct = p0.requested > 0 ? Math.min(100, Math.round((p0.allocated / p0.requested) * 100)) : 100;
            return (
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> P0 Life-Safety
                  </span>
                  <span className="font-mono font-bold text-[var(--text)]">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#27272A] overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300 ease-out"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                  <span>Alloc: {p0.allocated.toFixed(1)} kW</span>
                  <span>Req: {p0.requested.toFixed(1)} kW</span>
                </div>
              </div>
            );
          })()}

          {/* P1 Category Bar */}
          {(() => {
            const p1 = categoryTotals.P1;
            const pct = p1.requested > 0 ? Math.min(100, Math.round((p1.allocated / p1.requested) * 100)) : 0;
            return (
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    P1 Academic Priority
                  </span>
                  <span className="font-mono font-bold text-[var(--text)]">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#27272A] overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                  <span>Alloc: {p1.allocated.toFixed(1)} kW</span>
                  <span>Req: {p1.requested.toFixed(1)} kW</span>
                </div>
              </div>
            );
          })()}

          {/* P2 Category Bar */}
          {(() => {
            const p2 = categoryTotals.P2;
            const pct = p2.requested > 0 ? Math.min(100, Math.round((p2.allocated / p2.requested) * 100)) : 0;
            return (
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    P2 Standard Ops
                  </span>
                  <span className="font-mono font-bold text-[var(--text)]">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#27272A] overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-amber-500 transition-all duration-300 ease-out"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                  <span>Alloc: {p2.allocated.toFixed(1)} kW</span>
                  <span>Req: {p2.requested.toFixed(1)} kW</span>
                </div>
              </div>
            );
          })()}

          {/* P3 Category Bar */}
          {(() => {
            const p3 = categoryTotals.P3;
            const pct = p3.requested > 0 ? Math.min(100, Math.round((p3.allocated / p3.requested) * 100)) : 0;
            return (
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    P3 Flexible & Deferrable
                  </span>
                  <span className="font-mono font-bold text-[var(--text)]">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#27272A] overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-slate-500 dark:bg-slate-400 transition-all duration-300 ease-out"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                  <span>Alloc: {p3.allocated.toFixed(1)} kW</span>
                  <span>Req: {p3.requested.toFixed(1)} kW</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Main Load Table & Overrides Section */}
      <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] overflow-hidden transition-colors">
        {/* Table Header & Overrides Controls */}
        <div className="p-4 border-b border-[var(--border)] dark:border-[#27272A] flex items-center justify-between flex-wrap gap-4 bg-[var(--bg-secondary)] dark:bg-[#18181B]">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[14px] font-semibold text-[var(--text)]">
                Load Priority Allocation Schedule (Interactive & Editable)
              </h3>
              {hasManualOverrides && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 animate-pulse">
                  Manual Overrides Active
                </span>
              )}
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Administrators can edit the Allocated kW input for any load. The planner will dynamically recalculate total demand, unmet capacity, and feasibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasManualOverrides && (
              <button
                onClick={resetLoadOverrides}
                className="h-[30px] px-3 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Discard manual edits and return to pure algorithmic allocation"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset to Algorithm</span>
              </button>
            )}

            <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--blue)] dark:bg-[#38BDF8]" />
                Allocated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                Reduced
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs state-unknown" />
                Deferred
              </span>
            </div>
          </div>
        </div>

        {/* Editable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[var(--bg-secondary)] dark:bg-[#18181B] border-b border-[var(--border)] dark:border-[#27272A] text-[12px] text-[var(--text-secondary)]">
              <tr>
                <th className="p-3 w-16">Priority</th>
                <th className="p-3">Load Name & Location</th>
                <th className="p-3 text-right">Requested</th>
                <th className="p-3 text-right">Min Floor</th>
                <th className="p-3 text-right w-40">Allocated (Editable)</th>
                <th className="p-3 text-right">Reduced / Deferred</th>
                <th className="p-3 text-right">Unmet</th>
                <th className="p-3 w-44">Allocation Bar</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] dark:divide-[#27272A]">
              {loads.map((load) => {
                const req = Math.max(0.01, load.scaledRequestedKw);
                const allocPct = Math.min(100, Math.max(0, (load.allocatedKw / req) * 100));
                const redPct = Math.min(100 - allocPct, Math.max(0, (load.reducedKw / req) * 100));
                const defPct = Math.min(100 - allocPct - redPct, Math.max(0, (load.deferredKw / req) * 100));
                const isP0 = load.priority === 'P0';

                return (
                  <tr
                    key={load.loadId}
                    className={`hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors ${
                      load.isManuallyOverridden
                        ? 'bg-purple-50/40 dark:bg-purple-950/30'
                        : ''
                    }`}
                  >
                    {/* Priority Badge */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          isP0
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : load.priority === 'P1'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : load.priority === 'P2'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {load.priority}
                      </span>
                    </td>

                    {/* Name + Details */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {(isP0 || load.protected) && (
                          <span title="Protected essential load">
                            <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          </span>
                        )}
                        <span className="font-medium text-[var(--text)]">{load.loadName}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        <span className="font-mono text-[var(--blue-text)]">{load.loadId}</span> · {load.buildingId} / {load.roomId}
                      </div>
                    </td>

                    {/* Requested */}
                    <td className="p-3 text-right font-mono font-medium text-[var(--text)] tabular-nums">
                      {load.scaledRequestedKw.toFixed(1)} kW
                    </td>

                    {/* Min Floor */}
                    <td className="p-3 text-right font-mono text-[var(--text-secondary)] tabular-nums">
                      {load.effectiveMinKw.toFixed(1)} kW
                    </td>

                    {/* Editable Allocated kW Input with Quick Adjusters */}
                    <td className="p-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateLoadAllocation(
                                load.loadId,
                                Math.max(0, Math.round((load.allocatedKw - 0.5) * 10) / 10)
                              )
                            }
                            className="w-5 h-7 rounded border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] text-[var(--text)] text-xs font-bold flex items-center justify-center transition-colors"
                            title="Decrease by 0.5 kW"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={Math.max(50, req * 2)}
                            step="0.5"
                            value={load.allocatedKw}
                            onChange={(e) =>
                              updateLoadAllocation(load.loadId, parseFloat(e.target.value) || 0)
                            }
                            className={`w-16 h-7 text-right px-1 font-mono text-[12px] font-bold rounded border transition-all ${
                              load.isManuallyOverridden
                                ? 'border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-600 ring-1 ring-purple-400'
                                : 'border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--blue-text)]'
                            } focus:outline-hidden focus:ring-2 focus:ring-[var(--blue)]`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateLoadAllocation(
                                load.loadId,
                                Math.round((load.allocatedKw + 0.5) * 10) / 10
                              )
                            }
                            className="w-5 h-7 rounded border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] text-[var(--text)] text-xs font-bold flex items-center justify-center transition-colors"
                            title="Increase by 0.5 kW"
                          >
                            +
                          </button>
                          <span className="text-[11px] font-mono text-[var(--text-secondary)]">kW</span>
                        </div>

                        {/* Quick preset chips */}
                        <div className="flex items-center gap-1 text-[9px] font-mono">
                          <button
                            type="button"
                            onClick={() => updateLoadAllocation(load.loadId, 0)}
                            className="px-1 py-0.5 rounded bg-[var(--bg-secondary)] dark:bg-[#202024] text-[var(--text-secondary)] hover:text-red-500 transition-colors border border-[var(--border)] dark:border-[#27272A]"
                            title="Defer / zero allocation"
                          >
                            0 kW
                          </button>
                          <button
                            type="button"
                            onClick={() => updateLoadAllocation(load.loadId, load.effectiveMinKw)}
                            className="px-1 py-0.5 rounded bg-[var(--bg-secondary)] dark:bg-[#202024] text-[var(--text-secondary)] hover:text-amber-500 transition-colors border border-[var(--border)] dark:border-[#27272A]"
                            title="Set to minimum safe floor"
                          >
                            Min
                          </button>
                          <button
                            type="button"
                            onClick={() => updateLoadAllocation(load.loadId, load.scaledRequestedKw)}
                            className="px-1 py-0.5 rounded bg-[var(--bg-secondary)] dark:bg-[#202024] text-[var(--text-secondary)] hover:text-blue-500 transition-colors border border-[var(--border)] dark:border-[#27272A]"
                            title="Set to 100% requested load"
                          >
                            Req
                          </button>
                          {load.isManuallyOverridden && (
                            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400">
                              (mod)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Reduced / Deferred */}
                    <td className="p-3 text-right font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                      {load.reducedKw > 0 && `${load.reducedKw.toFixed(1)} kW red.`}
                      {load.deferredKw > 0 && `${load.deferredKw.toFixed(1)} kW def.`}
                      {load.reducedKw === 0 && load.deferredKw === 0 && '0 kW'}
                    </td>

                    {/* Unmet */}
                    <td className={`p-3 text-right font-mono font-semibold tabular-nums ${load.unmetKw > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {load.unmetKw.toFixed(1)} kW
                    </td>

                    {/* Inline Stacked Allocation Bar with Live Percentage and Smooth Updates */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 h-3.5 rounded-full bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] overflow-hidden flex shadow-inner"
                          title={`Allocated: ${load.allocatedKw.toFixed(1)} kW (${Math.round(allocPct)}%) | Reduced: ${load.reducedKw.toFixed(1)} kW | Deferred: ${load.deferredKw.toFixed(1)} kW`}
                        >
                          {allocPct > 0 && (
                            <div
                              style={{ width: `${allocPct}%` }}
                              className={`h-full transition-all duration-300 ease-out ${
                                allocPct >= 99
                                  ? 'bg-emerald-500 dark:bg-emerald-400'
                                  : 'bg-[var(--blue)] dark:bg-[#38BDF8]'
                              }`}
                            />
                          )}
                          {redPct > 0 && (
                            <div
                              style={{ width: `${redPct}%` }}
                              className="bg-amber-500 h-full transition-all duration-300 ease-out"
                            />
                          )}
                          {defPct > 0 && (
                            <div
                              style={{ width: `${defPct}%` }}
                              className="state-unknown h-full transition-all duration-300 ease-out"
                            />
                          )}
                        </div>
                        <span className={`text-[11px] font-mono font-bold w-10 text-right shrink-0 ${
                          allocPct >= 99
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : allocPct === 0
                            ? 'text-slate-400'
                            : 'text-[var(--text)]'
                        }`}>
                          {Math.round(allocPct)}%
                        </span>
                      </div>
                    </td>

                    {/* Status Chip */}
                    <td className="p-3 whitespace-nowrap">
                      <StatusBadge state={load.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Totals */}
        <div className="p-3.5 bg-[var(--bg-secondary)] dark:bg-[#18181B] border-t border-[var(--border)] dark:border-[#27272A] flex items-center justify-between flex-wrap gap-4 text-xs font-semibold">
          <span className="text-[var(--text)]">Capacity Total Verification:</span>
          <div className="flex items-center gap-6 font-mono tabular-nums">
            <span>Requested: {currentDemandKw.toFixed(1)} kW</span>
            <span>Mandatory Safe Floor: {allocationPlan.mandatoryTotalKw.toFixed(1)} kW</span>
            <span className="text-[var(--blue-text)]">Allocated Total: {allocationPlan.allocatedTotalKw.toFixed(1)} kW</span>
            <span className={allocationPlan.unmetTotalKw > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600'}>
              Unmet: {allocationPlan.unmetTotalKw.toFixed(1)} kW
            </span>
          </div>
        </div>
      </div>

      {/* Rationale & Traceability Panel */}
      <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-4 transition-colors">
        <h3 className="text-[14px] font-semibold text-[var(--text)]">
          Algorithmic Allocation Rationale & Traceability
        </h3>
        <div className="space-y-2.5">
          {loads
            .filter((l) => l.status === 'REDUCED' || l.status === 'DEFERRED' || l.status === 'AT_MINIMUM' || l.isManuallyOverridden)
            .map((l) => (
              <div
                key={l.loadId}
                className="p-3 rounded-[8px] bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] flex items-start justify-between gap-4 text-[13px]"
              >
                <div>
                  <div className="font-semibold text-[var(--text)] flex items-center gap-2">
                    <span className="font-mono text-[var(--blue-text)]">{l.loadId}</span>
                    <span>{l.loadName} ({l.priority})</span>
                    <StatusBadge state={l.status} size="sm" />
                    {l.isManuallyOverridden && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
                        Manual Override
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                    {l.explanation}
                  </p>
                  <div className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
                    Requested: {l.scaledRequestedKw} kW → Allocated: {l.allocatedKw} kW · Unmet: {l.unmetKw} kW
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded">
                    Approval Required
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Sticky Bottom Approval Panel */}
      <div className="fixed bottom-0 left-0 md:left-[240px] right-0 bg-[var(--bg)]/95 backdrop-blur-xs border-t border-[var(--border)] dark:border-[#27272A] dark:bg-black/95 p-4 z-30 shadow-xl transition-colors">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <input
              type="text"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Optional administrator approval justification / emergency operational order..."
              className="w-full h-[36px] px-3 text-[13px] border border-[var(--border)] dark:border-[#383842] rounded-[8px] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--blue)]"
            />
          </div>

          <div className="flex items-center gap-3">
            {planApproved ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  PLAN APPROVED & APPLIED (SIMULATED)
                </span>
                <button
                  onClick={() => rejectPlan('Plan approval rescinded.')}
                  className="h-[36px] px-3 text-[13px] font-medium text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-[8px]"
                >
                  Rescind
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => rejectPlan(adminComment)}
                  className="h-[36px] px-4 text-[13px] font-medium text-red-600 bg-[var(--bg)] dark:bg-[#121214] border border-red-300 dark:border-red-900 rounded-[8px] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  Reject Plan
                </button>
                <button
                  disabled={!feasible}
                  onClick={() => approvePlan(adminComment)}
                  className="h-[36px] px-5 text-[13px] font-semibold text-white bg-[var(--blue)] hover:bg-[var(--blue-hover)] rounded-[8px] transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Allocation Plan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Customizer Modal */}
      {isScenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] dark:border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--blue-text)]" />
                <h3 className="text-base font-semibold text-[var(--text)]">
                  Configure Emergency Scenario
                </h3>
              </div>
              <button
                onClick={() => setIsScenarioModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAndApplyScenario} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Scenario Name:</label>
                <input
                  type="text"
                  required
                  value={scenarioForm.name}
                  onChange={(e) => setScenarioForm({ ...scenarioForm, name: e.target.value })}
                  placeholder="e.g. Substation Transformer T2 Trip"
                  className="w-full h-8 px-2.5 rounded-md border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Operational Description:</label>
                <textarea
                  rows={2}
                  value={scenarioForm.description}
                  onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
                  placeholder="Explain event cause and parameters..."
                  className="w-full p-2 rounded-md border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Baseline Demand (kW):</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={scenarioForm.baselineDemandKw}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, baselineDemandKw: Number(e.target.value) || 100 })}
                    className="w-full h-8 px-2 font-mono rounded-md border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Surge Multiplier (x):</label>
                  <input
                    type="number"
                    min="1.0"
                    max="6.0"
                    step="0.1"
                    value={scenarioForm.multiplier}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, multiplier: Number(e.target.value) || 3.0 })}
                    className="w-full h-8 px-2 font-mono rounded-md border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Available Capacity (%):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="5"
                    value={scenarioForm.capacityPercent}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, capacityPercent: Number(e.target.value) || 50 })}
                    className="w-full h-8 px-2 font-mono rounded-md border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Duration (Hours):</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={scenarioForm.emergencyDurationHours}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, emergencyDurationHours: Number(e.target.value) || 1 })}
                    className="w-full h-8 px-2 font-mono rounded-md border border-[var(--border)] dark:border-[#383842] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)] dark:border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsScenarioModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] dark:border-[#383842] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue-hover)] font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Apply Scenario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
