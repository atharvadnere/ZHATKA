import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Zap,
  TrendingDown,
  DollarSign,
  Leaf,
  Info,
  Building,
  TrendingUp,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import { CONFIG } from '../config/defaults.ts';
import {
  getMonth30DayData,
  getWeek7DayData,
  getDay24HourData,
  getBuildingHistoricalSummaries,
} from '../data/historicalData.ts';

export const AnalyticsReports: React.FC = () => {
  const { kpis, rooms } = useAppState();

  const [periodTab, setPeriodTab] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [tariff, setTariff] = useState(CONFIG.tariffPerKwhInr);
  const [emissionFactor, setEmissionFactor] = useState(CONFIG.emissionFactorKgPerKwh);
  const [editingAssumption, setEditingAssumption] = useState(false);

  // Simulated telemetry models
  const monthData = useMemo(() => getMonth30DayData(kpis.totalDemandKw || 31.3), [kpis.totalDemandKw]);
  const weekData = useMemo(() => getWeek7DayData(kpis.totalDemandKw || 31.3), [kpis.totalDemandKw]);
  const dayData = useMemo(() => getDay24HourData(kpis.totalDemandKw || 31.3), [kpis.totalDemandKw]);
  const buildings = useMemo(() => getBuildingHistoricalSummaries(), []);

  // Aggregated totals
  const totalMonthKwh = useMemo(() => monthData.reduce((acc, d) => acc + d.totalKwh, 0), [monthData]);
  const totalMonthBaseKwh = useMemo(() => monthData.reduce((acc, d) => acc + d.baselineKwh, 0), [monthData]);
  const totalMonthAvoidableKwh = useMemo(() => monthData.reduce((acc, d) => acc + d.avoidableKwh, 0), [monthData]);

  const costEstimated = Math.round(totalMonthAvoidableKwh * tariff);
  const co2AvoidedKg = Math.round(totalMonthAvoidableKwh * emissionFactor * 10) / 10;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Date / Day', 'Total Consumption kWh', 'Baseline kWh', 'Peak Demand kW', 'Avg Occupancy %', 'Avoidable kWh'];
    const rows = monthData.map((d) => [
      `"${d.date}"`,
      d.totalKwh,
      d.baselineKwh,
      d.peakDemandKw,
      d.avgOccupancyPct,
      d.avoidableKwh,
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zhatka_30day_simulated_energy_report_${periodTab.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Analytics & 30-Day Simulated Telemetry Reports"
        tag="SIMULATED"
        description="Comprehensive 30-day empirical consumption metrics, baseline variances, and transparent environmental & economic impact calculations (DESIGN §6.9)."
        tabs={[
          { id: 'Daily', label: 'Daily (24h)' },
          { id: 'Weekly', label: 'Weekly Summary' },
          { id: 'Monthly', label: 'Monthly (30 Days)' },
          { id: 'Yearly', label: 'Annual Baseline' },
        ]}
        activeTab={periodTab}
        onTabChange={(t) => setPeriodTab(t as any)}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="h-[32px] px-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] dark:border-[#27272A] dark:bg-[#121214] text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#18181B] text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export 30D CSV</span>
            </button>
            <button
              onClick={handlePrintPdf}
              className="h-[32px] px-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] dark:border-[#27272A] dark:bg-[#121214] text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#18181B] text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        }
      />

      {/* Economic & Environmental Impact Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Estimate Box */}
        <div className="p-5 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--text)]">
              Estimated Monthly Avoidable Electricity Cost
            </span>
            <DataNatureTag nature="ESTIMATED" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[32px] font-bold text-[var(--blue-text)] tabular-nums">
              ₹{costEstimated.toLocaleString('en-IN')}
            </span>
            <span className="text-[13px] text-[var(--text-secondary)]">INR / 30-day intervention</span>
          </div>

          <div className="text-[12px] text-[var(--text-secondary)] flex items-center justify-between pt-2 border-t border-[var(--border)] dark:border-[#27272A]">
            <span>Assumption: Commercial tariff ₹{tariff.toFixed(2)} / kWh</span>
            <button
              onClick={() => setEditingAssumption(!editingAssumption)}
              className="text-[var(--blue-text)] hover:underline font-medium"
            >
              {editingAssumption ? 'Done' : 'Edit assumption'}
            </button>
          </div>

          {editingAssumption && (
            <div className="pt-2">
              <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Update Tariff (₹/kWh):</label>
              <input
                type="number"
                step="0.1"
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
                className="h-[30px] px-2 text-[12px] font-mono border rounded w-32 bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)] border-[var(--border)] dark:border-[#27272A]"
              />
            </div>
          )}
        </div>

        {/* CO2 Estimate Box */}
        <div className="p-5 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--text)]">
              Estimated Monthly Carbon Emissions Avoided
            </span>
            <DataNatureTag nature="ESTIMATED" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[32px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {co2AvoidedKg.toLocaleString()}
            </span>
            <span className="text-[13px] text-[var(--text-secondary)]">kg CO₂e</span>
          </div>

          <div className="text-[12px] text-[var(--text-secondary)] flex items-center justify-between pt-2 border-t border-[var(--border)] dark:border-[#27272A]">
            <span>Assumption: Indian grid factor {emissionFactor} kg CO₂ / kWh</span>
            <button
              onClick={() => setEditingAssumption(!editingAssumption)}
              className="text-[var(--blue-text)] hover:underline font-medium"
            >
              {editingAssumption ? 'Done' : 'Edit assumption'}
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Simulated Telemetry Overview */}
      <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-5 space-y-4 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--text)]">
              {periodTab === 'Monthly'
                ? '30-Day Simulated Telemetry Trend'
                : periodTab === 'Weekly'
                ? 'Weekly Telemetry Summary'
                : periodTab === 'Daily'
                ? 'Daily Hourly Telemetry'
                : 'Annual Baseline Projections'}
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Synthesized historical sensor metrics modeling real academic campus consumption patterns.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[var(--blue-text)] font-semibold">
              30D Total: {totalMonthKwh.toLocaleString()} kWh
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              Avoidable: {totalMonthAvoidableKwh.toLocaleString()} kWh
            </span>
          </div>
        </div>

        {/* Multi-Resolution Visual View */}
        {periodTab === 'Monthly' && (
          <div className="space-y-3">
            <div className="h-40 flex items-end gap-1 pt-4 pb-1 border-b border-[var(--border)] dark:border-[#27272A]">
              {monthData.map((d) => {
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
                    </div>
                    <div
                      style={{ height: `${hPct}%` }}
                      className="w-full bg-[var(--blue)] dark:bg-[#38BDF8] rounded-t-xs hover:opacity-80 transition-opacity"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
              <span>Day 1 (30 Days Ago)</span>
              <span>Day 15 (Mid-Month)</span>
              <span>Day 30 (Today)</span>
            </div>
          </div>
        )}

        {periodTab === 'Weekly' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {weekData.map((w) => (
              <div
                key={w.date}
                className="p-3 rounded-lg border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg-secondary)] dark:bg-[#18181B] space-y-1"
              >
                <div className="text-xs font-semibold text-[var(--text)]">{w.dayLabel}</div>
                <div className="text-base font-bold font-mono text-[var(--blue-text)]">{w.totalKwh} kWh</div>
                <div className="text-[11px] text-[var(--text-secondary)] flex justify-between">
                  <span>Peak: {w.peakDemandKw} kW</span>
                  <span className="text-amber-600 dark:text-amber-400">Waste: {w.avoidableKwh} kWh</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {periodTab === 'Daily' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {dayData.slice(0, 12).map((h) => (
              <div
                key={h.hour}
                className="p-2.5 rounded-md border border-[var(--border)] dark:border-[#27272A] bg-[var(--bg-secondary)] dark:bg-[#18181B]"
              >
                <div className="font-mono text-[var(--text-secondary)]">{h.hour}</div>
                <div className="font-bold text-[var(--text)] mt-0.5">{h.measuredKw} kW</div>
              </div>
            ))}
          </div>
        )}

        {periodTab === 'Yearly' && (
          <div className="p-4 bg-[var(--bg-secondary)] dark:bg-[#18181B] rounded-lg border border-[var(--border)] dark:border-[#27272A] text-xs space-y-2">
            <div className="font-semibold text-[var(--text)]">Annual Baseline Projection (12 Months)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-[var(--text-secondary)] block">Projected Annual Draw</span>
                <span className="font-bold font-mono text-base text-[var(--text)]">
                  {(totalMonthKwh * 12).toLocaleString()} kWh
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block">Projected Energy Spend</span>
                <span className="font-bold font-mono text-base text-emerald-600 dark:text-emerald-400">
                  ₹{((totalMonthKwh * 12) * tariff).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block">Annual Avoidable Savings</span>
                <span className="font-bold font-mono text-base text-[var(--blue-text)]">
                  ₹{(costEstimated * 12).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block">Annual CO₂ Reduction</span>
                <span className="font-bold font-mono text-base text-emerald-600">
                  {((co2AvoidedKg * 12) / 1000).toFixed(1)} metric tons
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campus Building 30-Day Historical Breakdown */}
      <div className="bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] overflow-hidden transition-colors">
        <div className="p-4 border-b border-[var(--border)] dark:border-[#27272A] bg-[var(--bg-secondary)] dark:bg-[#18181B] flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--text)] flex items-center gap-2">
              <Building className="w-4 h-4 text-[var(--blue-text)]" />
              <span>Campus Building 30-Day Simulated Historical Performance</span>
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Breakdown of power, expenditures, and efficiency across academic complexes.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-secondary)] dark:bg-[#18181B] border-b border-[var(--border)] dark:border-[#27272A] text-[var(--text-secondary)]">
              <tr>
                <th className="p-3">Building Name</th>
                <th className="p-3 text-right">30-Day Total Energy</th>
                <th className="p-3 text-right">Electricity Cost (INR)</th>
                <th className="p-3 text-right">Carbon Footprint</th>
                <th className="p-3 text-right">Peak Demand</th>
                <th className="p-3 text-right">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] dark:divide-[#27272A]">
              {buildings.map((b) => (
                <tr key={b.buildingId} className="hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024] transition-colors">
                  <td className="p-3 font-semibold text-[var(--text)] flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[var(--blue-light)] text-[var(--blue-text)] font-mono flex items-center justify-center font-bold">
                      {b.buildingId}
                    </span>
                    <span>{b.name}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-medium text-[var(--blue-text)] tabular-nums">
                    {b.monthTotalKwh.toLocaleString()} kWh
                  </td>
                  <td className="p-3 text-right font-mono text-[var(--text)] tabular-nums">
                    ₹{b.monthCostInr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {b.co2Kg.toLocaleString()} kg
                  </td>
                  <td className="p-3 text-right font-mono text-amber-600 dark:text-amber-400 tabular-nums font-bold">
                    {b.peakKw} kW
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {b.efficiencyScore}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
