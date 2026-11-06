import React, { useState, useMemo } from 'react';
import {
  Zap,
  AlertTriangle,
  Power,
  TrendingUp,
  ArrowRight,
  Filter,
  Calendar,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import {
  getDay24HourData,
  getWeek7DayData,
  getMonth30DayData,
  getBuildingHistoricalSummaries,
} from '../data/historicalData.ts';

export const EnergyMonitoring: React.FC = () => {
  const { rooms, setSelectedRoomId, setActivePage, markFalseAlarm, kpis } = useAppState();

  const [scope, setScope] = useState<'Room' | 'Floor' | 'Building'>('Room');
  const [timeRange, setTimeRange] = useState<'Today' | '7D' | '30D'>('Today');

  // Time-series telemetry datasets based on selected time window
  const hourlyData = useMemo(() => getDay24HourData(kpis.totalDemandKw || 31.3), [kpis.totalDemandKw]);
  const weeklyData = useMemo(() => getWeek7DayData(kpis.totalDemandKw || 31.3), [kpis.totalDemandKw]);
  const monthlyData = useMemo(() => getMonth30DayData(kpis.totalDemandKw || 31.3), [kpis.totalDemandKw]);
  const buildingSummaries = useMemo(() => getBuildingHistoricalSummaries(), []);

  // Find unusual consumption items per DESIGN.md §6.6
  const unusualItems = rooms.filter(
    (r) => r.usageFlag === 'HIGH_USAGE' || r.usageFlag === 'EMPTY_BUT_CONSUMING'
  );

  // Aggregated data by scope
  const buildingAggregates = useMemo(() => {
    const map = new Map<string, { currentKw: number; baselineKw: number; count: number }>();
    rooms.forEach((r) => {
      const cur = map.get(r.buildingId) || { currentKw: 0, baselineKw: 0, count: 0 };
      map.set(r.buildingId, {
        currentKw: Math.round((cur.currentKw + r.powerKw) * 10) / 10,
        baselineKw: Math.round((cur.baselineKw + r.baselinePowerKw) * 10) / 10,
        count: cur.count + 1,
      });
    });
    return Array.from(map.entries()).map(([bldg, data]) => ({
      bldg,
      name: `Academic Block ${bldg}`,
      ...data,
    }));
  }, [rooms]);

  const floorAggregates = useMemo(() => {
    const map = new Map<string, { currentKw: number; baselineKw: number; count: number }>();
    rooms.forEach((r) => {
      const floorNum = r.roomId.split('-')[1]?.[0] || '1';
      const floorKey = `${r.buildingId}-Floor ${floorNum}`;
      const cur = map.get(floorKey) || { currentKw: 0, baselineKw: 0, count: 0 };
      map.set(floorKey, {
        currentKw: Math.round((cur.currentKw + r.powerKw) * 10) / 10,
        baselineKw: Math.round((cur.baselineKw + r.baselinePowerKw) * 10) / 10,
        count: cur.count + 1,
      });
    });
    return Array.from(map.entries()).map(([floor, data]) => ({
      floor,
      ...data,
    }));
  }, [rooms]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Zap}
        title="Energy Monitoring & Dynamic Telemetry"
        tag="SIMULATED"
        description="Circuit-level real-time and historical multi-resolution energy monitoring, baseline comparisons, and anomaly detection (MASTER §7.4)."
      />

      {/* Scope Switch & Time Controls */}
      <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] flex items-center justify-between flex-wrap gap-4 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">Aggregation Scope:</span>
          <div className="flex items-center p-0.5 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-[6px] text-[12px] font-medium">
            {(['Room', 'Floor', 'Building'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-3 py-1 rounded-[4px] transition-colors ${
                  scope === s
                    ? 'bg-[var(--bg)] text-[var(--text)] dark:bg-[#27272A] dark:text-sky-300 shadow-xs font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">Historical Window:</span>
          <div className="flex items-center p-0.5 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-[6px] text-[12px] font-medium">
            {(['Today', '7D', '30D'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-[4px] transition-colors ${
                  timeRange === t
                    ? 'bg-[var(--bg)] text-[var(--text)] dark:bg-[#27272A] dark:text-sky-300 shadow-xs font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}
              >
                {t === 'Today' ? 'Today (24h)' : t === '7D' ? 'Last 7 Days' : 'Last 30 Days (Month)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Telemetry Chart Panel */}
      <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-4 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--text)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--blue-text)]" />
              <span>
                {timeRange === 'Today'
                  ? 'Today: Hourly Load Profile vs Baseline (24-Hour Telemetry)'
                  : timeRange === '7D'
                  ? 'Past 7 Days: Daily Consumption vs Target Baseline (kWh)'
                  : 'Past 30 Days: Full Monthly Simulated Telemetry Trend (30 Days)'}
              </span>
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              {timeRange === 'Today'
                ? 'Hour-by-hour sampled power draw and active building occupancy count.'
                : timeRange === '7D'
                ? 'Aggregated daily consumption (kWh) with peak demand markers.'
                : 'Complete 30-day realistic historical data model with weekday and weekend variances.'}
            </p>
          </div>
          <DataNatureTag nature="SIMULATED" />
        </div>

        {/* 1. TODAY: 24-Hour Interactive Hourly Chart */}
        {timeRange === 'Today' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Current Live Demand</span>
                <div className="text-base font-bold font-mono text-[var(--blue-text)] mt-0.5">
                  {kpis.totalDemandKw} kW
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Peak Hour (11:00 AM)</span>
                <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  {Math.round(kpis.totalDemandKw * 1.32 * 10) / 10} kW
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">24h Cumulative Energy</span>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {Math.round(kpis.totalDemandKw * 16.8)} kWh
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Idle Night Baseline</span>
                <div className="text-base font-bold font-mono text-[var(--text-secondary)] mt-0.5">
                  {Math.round(kpis.totalDemandKw * 0.35 * 10) / 10} kW
                </div>
              </div>
            </div>

            {/* 24 Bar Visualizer */}
            <div className="h-48 flex items-end gap-1 sm:gap-2 pt-6 pb-2 px-1 border-b border-[var(--border)] dark:border-[#27272A]">
              {hourlyData.map((pt, i) => {
                const maxKw = 50;
                const heightPct = Math.min(100, (pt.measuredKw / maxKw) * 100);
                const baseHeightPct = Math.min(100, (pt.baselineKw / maxKw) * 100);

                return (
                  <div
                    key={pt.hour}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] p-1.5 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      <div className="font-bold">{pt.hour}</div>
                      <div>Draw: {pt.measuredKw} kW</div>
                      <div>Base: {pt.baselineKw} kW</div>
                      <div>Occ: {pt.occupancyCount} persons</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Measured Bar */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[14px] rounded-t-xs transition-all ${
                          pt.isPeak
                            ? 'bg-[var(--blue)] dark:bg-[#38BDF8]'
                            : 'bg-blue-300 dark:bg-sky-700'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[var(--text-secondary)] mt-1 hidden sm:block">
                      {i % 3 === 0 ? pt.hour.slice(0, 2) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-1">
              <span>00:00 (Midnight)</span>
              <span>12:00 (Noon Peak)</span>
              <span>23:00 (Night Idle)</span>
            </div>
          </div>
        )}

        {/* 2. 7D: Weekly Daily Bar Comparison */}
        {timeRange === '7D' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">7-Day Total Energy</span>
                <div className="text-base font-bold font-mono text-[var(--blue-text)] mt-0.5">
                  {weeklyData.reduce((acc, d) => acc + d.totalKwh, 0).toLocaleString()} kWh
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Avoidable Energy Identified</span>
                <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  {weeklyData.reduce((acc, d) => acc + d.avoidableKwh, 0).toLocaleString()} kWh
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Average Campus Occupancy</span>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  63% Capacity
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {weeklyData.map((d) => {
                const maxKwh = 1000;
                const totPct = Math.min(100, (d.totalKwh / maxKwh) * 100);
                const basePct = Math.min(100, (d.baselineKwh / maxKwh) * 100);

                return (
                  <div
                    key={d.date}
                    className="p-3 rounded-lg border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg-secondary)]/40 dark:bg-[#18181B]/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text)]">{d.dayLabel}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[var(--blue-text)] font-bold">{d.totalKwh} kWh</span>
                        <span className="text-[var(--text-secondary)]">Base: {d.baselineKwh} kWh</span>
                        <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                          Peak: {d.peakDemandKw} kW
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-[var(--bg-secondary)] dark:bg-[#202024] rounded-full overflow-hidden relative">
                      <div
                        style={{ width: `${basePct}%` }}
                        className="h-full bg-slate-300 dark:bg-zinc-700 absolute top-0 left-0"
                      />
                      <div
                        style={{ width: `${totPct}%` }}
                        className="h-full bg-[var(--blue)] dark:bg-[#38BDF8] opacity-80 absolute top-0 left-0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. 30D: Complete 30-Day Simulated Historical Data */}
        {timeRange === '30D' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">30-Day Total Energy</span>
                <div className="text-base font-bold font-mono text-[var(--blue-text)] mt-0.5">
                  {monthlyData.reduce((acc, d) => acc + d.totalKwh, 0).toLocaleString()} kWh
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Est. Electricity Cost</span>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹{(monthlyData.reduce((acc, d) => acc + d.totalKwh, 0) * 9.5).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">30-Day Avoidable Waste</span>
                <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  {monthlyData.reduce((acc, d) => acc + d.avoidableKwh, 0).toLocaleString()} kWh
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A]">
                <span className="text-[var(--text-secondary)]">Month Peak Demand</span>
                <div className="text-base font-bold font-mono text-red-600 dark:text-red-400 mt-0.5">
                  {Math.max(...monthlyData.map((d) => d.peakDemandKw))} kW
                </div>
              </div>
            </div>

            {/* 30 Day Bar Strip */}
            <div className="p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-xl border border-[var(--border)] dark:border-[#27272A] space-y-2">
              <div className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
                <span>Daily kWh Trend (30 Days Telemetry Sampling)</span>
                <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                  Hover bars for daily breakdown
                </span>
              </div>
              <div className="h-32 flex items-end gap-1 pt-4 pb-1">
                {monthlyData.map((d) => {
                  const maxVal = 1000;
                  const hPct = Math.min(100, (d.totalKwh / maxVal) * 100);

                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] p-1.5 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        <div className="font-bold">{d.date}</div>
                        <div>Total: {d.totalKwh} kWh</div>
                        <div>Peak: {d.peakDemandKw} kW</div>
                        <div>Avoidable: {d.avoidableKwh} kWh</div>
                      </div>
                      <div
                        style={{ height: `${hPct}%` }}
                        className="w-full bg-[var(--blue)] hover:bg-[var(--blue-hover)] dark:bg-[#38BDF8] rounded-t-xs transition-colors"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                <span>Day 1 (30 days ago)</span>
                <span>Day 15</span>
                <span>Day 30 (Today)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Visuals & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Aggregated Table by Scope */}
        <div className="lg:col-span-8 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--text)]">
                {scope === 'Room'
                  ? 'Monitored Room Circuit Telemetry'
                  : scope === 'Floor'
                  ? 'Floor-Level Aggregation & Sub-metering'
                  : 'Campus Building Summary & Efficiency'}
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                {scope === 'Room'
                  ? 'Monitored individual rooms (kW) · Tagged as simulated telemetry'
                  : scope === 'Floor'
                  ? 'Aggregated circuit telemetry grouped by floor levels'
                  : 'Building-level aggregated consumption vs baseline'}
              </p>
            </div>
            <DataNatureTag nature="SIMULATED" />
          </div>

          {/* ROOM SCOPE */}
          {scope === 'Room' && (
            <div className="space-y-3 pt-2">
              {rooms.map((room) => {
                const maxScale = 15;
                const curPct = Math.min(100, (room.powerKw / maxScale) * 100);
                const basePct = Math.min(100, (room.baselinePowerKw / maxScale) * 100);
                const isExcess = room.powerKw > room.baselinePowerKw;

                return (
                  <div
                    key={room.roomId}
                    onClick={() => setSelectedRoomId(room.roomId)}
                    className="p-3 rounded-[8px] hover:bg-[var(--bg-hover)] dark:hover:bg-[#1E1E22] cursor-pointer transition-colors space-y-1.5 border border-[var(--border)] dark:border-[#27272A]"
                  >
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--blue-text)]">{room.roomId}</span>
                        <span className="font-medium text-[var(--text)]">{room.roomName}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono tabular-nums">
                        <span className={isExcess ? 'font-bold text-[var(--blue-text)]' : 'text-[var(--text)]'}>
                          Current: {room.powerKw} kW
                        </span>
                        <span className="text-[var(--text-secondary)]">Base: {room.baselinePowerKw} kW</span>
                      </div>
                    </div>

                    <div className="h-3 w-full bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-full overflow-hidden relative">
                      <div
                        style={{ width: `${basePct}%` }}
                        className="h-full bg-slate-300 dark:bg-zinc-700 absolute top-0 left-0"
                      />
                      <div
                        style={{ width: `${curPct}%` }}
                        className={`h-full absolute top-0 left-0 opacity-80 ${
                          isExcess ? 'bg-[var(--blue)] dark:bg-[#38BDF8]' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FLOOR SCOPE */}
          {scope === 'Floor' && (
            <div className="space-y-3 pt-2">
              {floorAggregates.map((fl) => {
                const maxScale = 25;
                const curPct = Math.min(100, (fl.currentKw / maxScale) * 100);
                const basePct = Math.min(100, (fl.baselineKw / maxScale) * 100);
                const isExcess = fl.currentKw > fl.baselineKw;

                return (
                  <div
                    key={fl.floor}
                    className="p-3.5 rounded-[8px] bg-[var(--bg-secondary)]/50 dark:bg-[#18181B]/50 border border-[var(--border)] dark:border-[#27272A] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text)]">{fl.floor}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[var(--blue-text)] font-bold">{fl.currentKw} kW</span>
                        <span className="text-[var(--text-secondary)]">Base: {fl.baselineKw} kW</span>
                        <span className="text-[11px] text-[var(--text-secondary)]">({fl.count} circuits)</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-[var(--bg-secondary)] dark:bg-[#202024] rounded-full overflow-hidden relative">
                      <div style={{ width: `${basePct}%` }} className="h-full bg-slate-300 dark:bg-zinc-700 absolute" />
                      <div
                        style={{ width: `${curPct}%` }}
                        className={`h-full absolute opacity-80 ${
                          isExcess ? 'bg-[var(--blue)] dark:bg-[#38BDF8]' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BUILDING SCOPE */}
          {scope === 'Building' && (
            <div className="space-y-3 pt-2">
              {buildingSummaries.map((b) => (
                <div
                  key={b.buildingId}
                  className="p-3.5 rounded-lg border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg-secondary)]/40 dark:bg-[#18181B]/40 flex items-center justify-between flex-wrap gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--blue-light)] text-[var(--blue-text)] flex items-center justify-center font-bold font-mono">
                      {b.buildingId}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[var(--text)]">{b.name}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        Monthly: {b.monthTotalKwh.toLocaleString()} kWh · ₹{b.monthCostInr.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[var(--text-secondary)] text-[10px] block">Peak Demand</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{b.peakKw} kW</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] text-[10px] block">Efficiency Score</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{b.efficiencyScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side Panel: Unusual Consumption Flags with False Alarm Support */}
        <div className="lg:col-span-4 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-4 transition-colors">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--text)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Unusual Consumption Flags</span>
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">
              Possible equipment anomaly — inspection recommended. Never auto-diagnoses hardware.
            </p>
          </div>

          <div className="space-y-3">
            {unusualItems.length === 0 ? (
              <div className="p-4 text-center rounded-lg bg-[var(--bg-secondary)] dark:bg-[#18181B] text-xs text-[var(--text-secondary)]">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                No abnormal power deviations detected.
              </div>
            ) : (
              unusualItems.map((item) => {
                const excess = Math.max(0, item.powerKw - item.baselinePowerKw);
                return (
                  <div
                    key={item.roomId}
                    className="p-3.5 bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] rounded-[8px] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[var(--text)]">{item.roomId}</span>
                      <StatusBadge state={item.usageFlag} size="sm" />
                    </div>

                    <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                      Power draw is <span className="font-semibold text-[var(--text)] font-mono">{item.powerKw} kW</span> (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold font-mono">+{excess.toFixed(1)} kW</span> above{' '}
                      {item.baselinePowerKw} kW baseline).
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] dark:border-[#27272A]">
                      <button
                        onClick={() => setSelectedRoomId(item.roomId)}
                        className="text-[11px] font-semibold text-[var(--blue-text)] hover:underline flex items-center gap-1"
                      >
                        <span>Inspect Room</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => markFalseAlarm(`REC-${item.roomId}`, 'Flagged from Energy Monitoring unusual consumption panel.')}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                      >
                        False Alarm
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
