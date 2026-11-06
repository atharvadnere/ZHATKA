import React, { useState } from 'react';
import {
  House,
  Zap,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Siren,
  FileCheck,
  Clock,
  ArrowRight,
  Activity,
  Calendar,
  Building,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatStrip } from '../components/common/StatStrip.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';

export const CampusOverview: React.FC = () => {
  const {
    kpis,
    rooms,
    loads,
    recommendations,
    auditEvents,
    setActivePage,
    setSelectedRoomId,
    loadScenario,
    latestValidationReport,
  } = useAppState();

  const [timeFilter, setTimeFilter] = useState<'Today' | '7D' | '30D' | 'Year'>('Today');

  // Building consumption aggregates
  const buildingMap = new Map<string, { powerKw: number; baselineKw: number; count: number }>();
  for (const r of rooms) {
    const cur = buildingMap.get(r.buildingId) || { powerKw: 0, baselineKw: 0, count: 0 };
    cur.powerKw += r.powerKw;
    cur.baselineKw += r.baselinePowerKw;
    cur.count += 1;
    buildingMap.set(r.buildingId, cur);
  }
  const buildingStats = Array.from(buildingMap.entries()).map(([bId, stat]) => ({
    buildingId: bId,
    powerKw: Math.round(stat.powerKw * 10) / 10,
    baselineKw: Math.round(stat.baselineKw * 10) / 10,
    count: stat.count,
  }));

  const totalOccupancySlots = rooms.length;
  const occupiedPct = totalOccupancySlots > 0 ? (kpis.occupiedRoomsCount / totalOccupancySlots) * 100 : 0;
  const vacantPct = totalOccupancySlots > 0 ? (kpis.vacantRoomsCount / totalOccupancySlots) * 100 : 0;
  const unknownPct = totalOccupancySlots > 0 ? (kpis.unknownRoomsCount / totalOccupancySlots) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={House}
        title="Campus Overview"
        tag="SIMULATED"
        description="Comprehensive real-time campus electricity demand, occupancy correlation, and potentially avoidable consumption."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage('planner')}
              className="h-[32px] px-3 rounded-[8px] bg-[#FCE4E4] text-[#B42318] hover:bg-[#fad4d4] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Emergency Planner</span>
            </button>
            <button
              onClick={() => setActivePage('data-integrity')}
              className="h-[32px] px-3 rounded-[8px] bg-white border border-[#D4D4D1] text-[#202124] hover:bg-[#F1F1EF] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E6B3A]" />
              <span>Validate Data</span>
            </button>
          </div>
        }
      />

      {/* 1. Stat Strip (6 Cells) per DESIGN.md §6.2 */}
      <StatStrip
        cells={[
          {
            label: 'Total Demand',
            value: kpis.totalDemandKw,
            unit: 'kW',
            tag: 'SIMULATED',
            caption: `${rooms.length - kpis.meterOfflineCount} rooms reporting`,
          },
          {
            label: 'Available Capacity',
            value: kpis.availableCapacityKw,
            unit: 'kW',
            caption: 'Substation limit (simulated)',
          },
          {
            label: 'Potentially Avoidable',
            value: kpis.potentiallyAvoidableKw,
            unit: 'kW',
            tag: 'POTENTIAL',
            captionColor: 'text-[#8A5A00]',
            caption: 'Idle rooms & excess load',
          },
          {
            label: 'Room Occupancy',
            value: `${kpis.occupiedRoomsCount} / ${kpis.vacantRoomsCount}`,
            unit: 'occ / vac',
            caption: `${kpis.unknownRoomsCount} unknown / offline`,
          },
          {
            label: 'Active Alerts',
            value: kpis.activeAlertsCount,
            captionColor: kpis.activeAlertsCount > 0 ? 'text-[#B42318]' : 'text-[#2F9E5B]',
            caption: kpis.activeAlertsCount > 0 ? 'Action review suggested' : 'Nominal operation',
          },
          {
            label: 'Estimated Savings',
            value: kpis.estimatedSavingsKwh,
            unit: 'kWh',
            tag: 'ESTIMATED',
            captionColor: 'text-[#1F5FB0]',
            caption: `₹${kpis.estimatedCostSavingsInr.toLocaleString('en-IN')} / 4h window`,
          },
        ]}
      />

      {/* 2. Two-Column Row: Consumption Trend & Room Occupancy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Consumption Trend */}
        <div className="lg:col-span-7 bg-white border border-[#E8E8E6] rounded-[10px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-semibold text-[#202124]">
                Campus Consumption Trend vs Baseline
              </h3>
              <p className="text-[12px] text-[#737373]">
                Monitored sample rooms (kW) · Solid line: simulated measured · Dashed: expected baseline
              </p>
            </div>
            {/* Time Segmented Control */}
            <div className="flex items-center p-0.5 bg-[#F1F1EF] rounded-[6px] text-[11px] font-medium">
              {(['Today', '7D', '30D', 'Year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-2.5 py-1 rounded-[4px] transition-colors ${
                    timeFilter === t
                      ? 'bg-white text-[#202124] shadow-xs font-semibold'
                      : 'text-[#737373] hover:text-[#202124]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Flat Bar/Line Visualization */}
          <div className="h-[180px] w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#E8E8E6]">
            {buildingStats.map((b) => {
              const maxScale = 20; // kW reference
              const heightPower = Math.min(100, Math.round((b.powerKw / maxScale) * 100));
              const heightBase = Math.min(100, Math.round((b.baselineKw / maxScale) * 100));
              const isExcess = b.powerKw > b.baselineKw;

              return (
                <div key={b.buildingId} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="text-[11px] font-mono text-[#737373] tabular-nums mb-1">
                    {b.powerKw} kW
                  </div>
                  <div className="w-full max-w-[42px] flex items-end gap-1.5 h-[120px]">
                    {/* Measured bar */}
                    <div
                      className={`flex-1 rounded-t-[4px] transition-all duration-300 ${
                        isExcess ? 'bg-[#3478D4]' : 'bg-[#4CA56B]'
                      }`}
                      style={{ height: `${heightPower}%` }}
                      title={`Building ${b.buildingId} current: ${b.powerKw} kW`}
                    />
                    {/* Baseline indicator */}
                    <div
                      className="flex-1 rounded-t-[4px] bg-[#D4D4D1] transition-all duration-300"
                      style={{ height: `${heightBase}%` }}
                      title={`Building ${b.buildingId} baseline: ${b.baselineKw} kW`}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-[#202124] mt-2">
                    Block {b.buildingId}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#737373]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-[#3478D4] rounded-xs" />
                Current Power (kW)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-[#D4D4D1] rounded-xs" />
                Expected Baseline (kW)
              </span>
            </div>
            <DataNatureTag nature="SIMULATED" />
          </div>
        </div>

        {/* Right: Room Occupancy Breakdown (DESIGN.md 3.4 Hatched UNKNOWN) */}
        <div className="lg:col-span-5 bg-white border border-[#E8E8E6] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-semibold text-[#202124]">
                Room Occupancy Breakdown
              </h3>
              <span className="text-[11px] font-mono text-[#737373]">
                {rooms.length} monitored rooms
              </span>
            </div>
            <p className="text-[12px] text-[#737373] mb-4">
              Visualising verified states. UNKNOWN is never coerced to zero.
            </p>

            {/* Horizontal Stacked Bar */}
            <div className="h-7 w-full rounded-[6px] border border-[#E8E8E6] overflow-hidden flex">
              {occupiedPct > 0 && (
                <div
                  style={{ width: `${occupiedPct}%` }}
                  className="bg-[#EAF2FC] border-r border-[#3478D4]/30 flex items-center justify-center text-[11px] font-bold text-[#1F5FB0]"
                  title={`Occupied: ${kpis.occupiedRoomsCount} rooms`}
                >
                  {kpis.occupiedRoomsCount}
                </div>
              )}
              {vacantPct > 0 && (
                <div
                  style={{ width: `${vacantPct}%` }}
                  className="bg-[#F1F1EF] border-r border-[#D4D4D1] flex items-center justify-center text-[11px] font-medium text-[#6B6B6B]"
                  title={`Verified Empty: ${kpis.vacantRoomsCount} rooms`}
                >
                  {kpis.vacantRoomsCount}
                </div>
              )}
              {unknownPct > 0 && (
                <div
                  style={{ width: `${unknownPct}%` }}
                  className="state-unknown flex items-center justify-center text-[11px] font-bold"
                  title={`UNKNOWN: ${kpis.unknownRoomsCount} rooms (sensor offline or degraded)`}
                >
                  {kpis.unknownRoomsCount} ?
                </div>
              )}
            </div>

            {/* Legend & Breakdown List */}
            <div className="mt-4 space-y-2 text-[12px]">
              <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#FAFAF9] border border-[#E8E8E6]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3478D4]" />
                  <span className="font-medium text-[#202124]">Occupied (In Session)</span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-[#202124]">
                  {kpis.occupiedRoomsCount} rooms ({occupiedPct.toFixed(0)}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#FAFAF9] border border-[#E8E8E6]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3A3A0]" />
                  <span className="font-medium text-[#202124]">Verified Empty</span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-[#202124]">
                  {kpis.vacantRoomsCount} rooms ({vacantPct.toFixed(0)}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-[6px] state-unknown border border-dashed border-[#A3A3A0]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#6B6B6B]">?</span>
                  <span className="font-semibold text-[#202124]">Unknown Occupancy</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-[#6B6B6B]">
                  {kpis.unknownRoomsCount} room ({unknownPct.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#F7F7F5] rounded-[6px] border border-[#E8E8E6] text-[11px] text-[#737373]">
            Safety rule: UNKNOWN occupancy is never treated as verified empty or switched off automatically.
          </div>
        </div>
      </div>

      {/* 3. Three-Column Row: Compact Lists per DESIGN.md §6.2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: Recent Notifications */}
        <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-[#202124]">
                Priority Action Queue
              </h3>
              <span className="text-[11px] font-mono text-[#737373]">
                {recommendations.length} items
              </span>
            </div>
            <div className="divide-y divide-[#F1F1EF]">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.recommendationId}
                  onClick={() => {
                    if (rec.roomId) setSelectedRoomId(rec.roomId);
                    setActivePage('intelligence');
                  }}
                  className="py-2.5 hover:bg-[#F7F7F5] cursor-pointer rounded-[6px] transition-colors text-left"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12px] font-semibold text-[#202124] truncate">
                      {rec.title}
                    </span>
                    <StatusBadge state={rec.safetyStatus.decision} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#737373] truncate mt-0.5">
                    {rec.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActivePage('intelligence')}
            className="mt-3 text-[12px] font-medium text-[#3478D4] hover:underline flex items-center gap-1"
          >
            <span>Review all recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Col 2: Recent Admin Activity */}
        <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-[#202124]">
                Audit Activity Stream
              </h3>
              <span className="text-[11px] font-mono text-[#737373]">
                {auditEvents.length} logged
              </span>
            </div>
            <div className="divide-y divide-[#F1F1EF]">
              {auditEvents.slice(0, 3).map((evt) => (
                <div key={evt.eventId} className="py-2.5 text-left">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-[#3478D4]">{evt.eventId}</span>
                    <span className="text-[#737373]">
                      {new Date(evt.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[12px] font-medium text-[#202124] truncate mt-0.5">
                    {evt.action}: {evt.target || 'System'}
                  </div>
                  <div className="text-[11px] text-[#737373] truncate">
                    {evt.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActivePage('audit')}
            className="mt-3 text-[12px] font-medium text-[#3478D4] hover:underline flex items-center gap-1"
          >
            <span>Inspect audit trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Col 3: Quick Operator Actions */}
        <div className="bg-white border border-[#E8E8E6] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#202124] mb-3">
              Quick Operator Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  loadScenario(2);
                }}
                className="w-full p-2 rounded-[8px] bg-[#FCE4E4] border border-[#D92D20]/30 hover:bg-[#fad4d4] text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[12px] font-semibold text-[#B42318]">Run 3× Surge Scenario</div>
                  <div className="text-[11px] text-[#B42318]/80">Test emergency deficit rationing</div>
                </div>
                <Siren className="w-4 h-4 text-[#D92D20] shrink-0" />
              </button>

              <button
                onClick={() => setActivePage('data-integrity')}
                className="w-full p-2 rounded-[8px] bg-[#F7F7F5] border border-[#E8E8E6] hover:bg-[#F1F1EF] text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[12px] font-semibold text-[#202124]">Validate Ingestion File</div>
                  <div className="text-[11px] text-[#737373]">Run 7-stage security pipeline</div>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#1E6B3A] shrink-0" />
              </button>

              <button
                onClick={() => setActivePage('intelligence')}
                className="w-full p-2 rounded-[8px] bg-[#F7F7F5] border border-[#E8E8E6] hover:bg-[#F1F1EF] text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[12px] font-semibold text-[#202124]">View Held Recommendations</div>
                  <div className="text-[11px] text-[#737373]">Inspect safety suppression reasons</div>
                </div>
                <AlertTriangle className="w-4 h-4 text-[#E0A03A] shrink-0" />
              </button>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-[#737373]">
            Operator role: Campus Energy Administrator (simulated)
          </div>
        </div>
      </div>

      {/* 4. Data Quality Summary Strip (DESIGN.md §6.2) */}
      <div className="p-3.5 bg-white border border-[#E8E8E6] rounded-[10px] flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#1E6B3A] shrink-0" />
          <div>
            <div className="text-[13px] font-semibold text-[#202124] flex items-center gap-2">
              <span>Telemetry Ingestion & Quality Health</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[#DDF3E4] text-[#1E6B3A] font-semibold">
                PIPELINE READY
              </span>
            </div>
            <div className="text-[12px] text-[#737373] mt-0.5">
              {latestValidationReport ? (
                <span>
                  Latest file: <span className="font-mono text-[#202124]">{latestValidationReport.fileName}</span> · {latestValidationReport.totals.accepted} accepted, {latestValidationReport.totals.rejected} rejected, {latestValidationReport.totals.quarantined} quarantined.
                </span>
              ) : (
                <span>Initial seed telemetry verified. Ready for CSV / JSON batch upload.</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActivePage('data-integrity')}
          className="h-[30px] px-3 rounded-[6px] text-[12px] font-medium bg-[#F7F7F5] border border-[#D4D4D1] hover:bg-[#F1F1EF] transition-colors flex items-center gap-1.5"
        >
          <span>Open Data Integrity</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#737373]" />
        </button>
      </div>
    </div>
  );
};
