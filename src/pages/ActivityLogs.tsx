import React, { useState } from 'react';
import {
  ScrollText,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Shield,
  FileCheck,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { DataNatureTag } from '../components/common/DataNatureTag.tsx';
import { generateSafeAuditCsv } from '../logic/audit/auditLog.ts';

export const ActivityLogs: React.FC = () => {
  const { auditEvents, recommendations, rooms } = useAppState();

  const [activeTab, setActiveTab] = useState<'audit' | 'verification'>('audit');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Download safe CSV
  const handleDownloadCsv = () => {
    const csvContent = generateSafeAuditCsv(auditEvents);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zhatka_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = auditEvents.filter((e) => {
    if (actionFilter !== 'ALL' && e.action !== actionFilter) return false;
    if (outcomeFilter !== 'ALL' && e.outcome !== outcomeFilter) return false;
    return true;
  });

  // Verification items: Completed or verified recommendations
  const verifiedActions = recommendations.filter(
    (r) => r.approvalStatus === 'COMPLETED' || r.approvalStatus === 'VERIFIED'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Activity Logs & Verification Centre"
        tag="SIMULATED"
        description="Immutable append-only audit trail and empirical before/after savings verification panel (MASTER.md Module 5)."
        tabs={[
          { id: 'audit', label: 'Append-Only Audit Trail', count: auditEvents.length },
          { id: 'verification', label: 'Savings Verification', count: verifiedActions.length },
        ]}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as any)}
        actions={
          activeTab === 'audit' && (
            <button
              onClick={handleDownloadCsv}
              className="h-[32px] px-3 rounded-[8px] bg-white border border-[#D4D4D1] text-[#202124] hover:bg-[#F1F1EF] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Audit CSV (Formula-Safe)</span>
            </button>
          )
        }
      />

      {/* TAB 1: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3.5 bg-white border border-[#E8E8E6] rounded-[10px] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-[32px] px-2.5 text-[12px] border border-[#D4D4D1] rounded-[6px] bg-white"
              >
                <option value="ALL">All Actions</option>
                <option value="RECOMMENDATION_APPROVED">Recommendation Approved</option>
                <option value="ACTION_COMPLETED">Action Completed</option>
                <option value="ACTION_VERIFIED">Action Verified</option>
                <option value="ALLOCATION_RUN">Allocation Run</option>
                <option value="CONTROL_BLOCKED">Control Blocked</option>
                <option value="FILE_VALIDATED">File Validated</option>
                <option value="EQUIPMENT_CHANGED">Equipment Changed</option>
                <option value="DEMO_RESET">Demo Reset</option>
              </select>

              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="h-[32px] px-2.5 text-[12px] border border-[#D4D4D1] rounded-[6px] bg-white"
              >
                <option value="ALL">All Outcomes</option>
                <option value="SUCCESS">Success</option>
                <option value="BLOCKED">Blocked</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="text-[12px] text-[#737373]">
              Showing <span className="font-mono font-semibold text-[#202124]">{filteredEvents.length}</span> of {auditEvents.length} events (Capped at 1,000)
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">Event ID</th>
                    <th className="p-3">Time (Asia/Kolkata)</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Outcome</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E6]">
                  {filteredEvents.map((evt) => {
                    const isExpanded = expandedEventId === evt.eventId;
                    const isBlocked = evt.outcome === 'BLOCKED' || evt.outcome === 'FAILED';
                    const kolkataTime = new Intl.DateTimeFormat('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      day: '2-digit',
                      month: 'short',
                    }).format(new Date(evt.timestamp));

                    return (
                      <React.Fragment key={evt.eventId}>
                        <tr
                          onClick={() => setExpandedEventId(isExpanded ? null : evt.eventId)}
                          className="hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                        >
                          <td className="p-3 text-[#737373]">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </td>
                          <td className="p-3 font-mono font-bold text-[#3478D4]">{evt.eventId}</td>
                          <td className="p-3 font-mono text-[#737373]">{kolkataTime}</td>
                          <td className="p-3 font-medium text-[#202124]">
                            <span className="font-mono text-[11px] bg-[#F1F1EF] px-1.5 py-0.5 rounded">
                              {evt.action}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[#202124]">{evt.target || '—'}</td>
                          <td className="p-3">
                            <span
                              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isBlocked ? 'bg-[#FCE4E4] text-[#B42318]' : 'bg-[#DDF3E4] text-[#1E6B3A]'
                              }`}
                            >
                              {evt.outcome}
                            </span>
                          </td>
                          <td className="p-3 text-[#737373] text-[11px]">{evt.actor}</td>
                          <td className="p-3 text-[#737373] max-w-xs truncate" title={evt.reason}>
                            {evt.reason}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#FAFAF9]">
                            <td colSpan={8} className="p-4 border-b border-[#E8E8E6]">
                              <div className="p-3 bg-white border border-[#E8E8E6] rounded-[6px] space-y-2">
                                <div className="text-[11px] font-mono font-semibold text-[#737373]">
                                  Full Structured Audit JSON Payload ({evt.eventId})
                                </div>
                                <pre className="font-mono text-[11px] text-[#202124] p-2 bg-[#F7F7F5] rounded overflow-x-auto whitespace-pre">
                                  {JSON.stringify(evt, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFICATION PANEL (MASTER §11.2 & §11.3) */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#FAFAF9] border border-[#E8E8E6] rounded-[8px] flex items-center justify-between text-[12px] text-[#737373]">
            <span>
              <strong>Savings Verification Formula:</strong> Savings (kWh) = Baseline consumption (kWh) − Post-action consumption (kWh) over standard window W = 4 hours.
            </span>
            <DataNatureTag nature="MEASURED (SIMULATED)" />
          </div>

          <div className="bg-white border border-[#E8E8E6] rounded-[10px] overflow-hidden">
            <div className="p-4 border-b border-[#E8E8E6] flex items-center justify-between bg-[#FAFAF9]">
              <h3 className="text-[14px] font-semibold text-[#202124]">
                Empirical Savings Verification Table
              </h3>
              <span className="text-[12px] text-[#737373]">
                Strict separation of Potential, Estimated, and Measured figures
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#F7F7F5] border-b border-[#E8E8E6] text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Target Room</th>
                    <th className="p-3 text-right">Pre-Action Power</th>
                    <th className="p-3 text-right">Post-Action Power</th>
                    <th className="p-3 text-right">Potential (kW)</th>
                    <th className="p-3 text-right">Estimated (kWh)</th>
                    <th className="p-3 text-right font-bold text-[#1E6B3A]">Measured Simulated (kWh)</th>
                    <th className="p-3">Verification Formula</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E6]">
                  {/* Row for A-102 (from MASTER §18 Scenario 5) */}
                  <tr className="hover:bg-[#F7F7F5]">
                    <td className="p-3 font-semibold font-mono text-[#3478D4]">A-102</td>
                    <td className="p-3 text-right font-mono tabular-nums">3.1 kW</td>
                    <td className="p-3 text-right font-mono tabular-nums">0.9 kW</td>
                    <td className="p-3 text-right font-mono text-[#8A5A00] tabular-nums">
                      2.5 kW <DataNatureTag nature="POTENTIAL" className="ml-1" />
                    </td>
                    <td className="p-3 text-right font-mono text-[#1F5FB0] tabular-nums">
                      10.0 kWh <DataNatureTag nature="ESTIMATED" className="ml-1" />
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#1E6B3A] tabular-nums">
                      8.8 kWh <DataNatureTag nature="MEASURED (SIMULATED)" className="ml-1" />
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#737373]">
                      12.4 kWh (base) − 3.6 kWh (post) = 8.8 kWh
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#DDF3E4] text-[#1E6B3A] uppercase">
                        VERIFIED
                      </span>
                    </td>
                  </tr>

                  {/* Planner Capacity Compliance Check per §11.2 */}
                  <tr className="hover:bg-[#F7F7F5]">
                    <td className="p-3 font-semibold font-mono text-[#5B3FA8]">Emergency Planner (P0-P3)</td>
                    <td className="p-3 text-right font-mono tabular-nums">300.0 kW</td>
                    <td className="p-3 text-right font-mono tabular-nums">50.0 kW</td>
                    <td className="p-3 text-right font-mono text-[#8A5A00] tabular-nums">250.0 kW</td>
                    <td className="p-3 text-right font-mono text-[#1F5FB0] tabular-nums">250.0 kWh</td>
                    <td className="p-3 text-right font-mono font-bold text-[#1E6B3A] tabular-nums">
                      Capacity Compliant
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#737373]">
                      Allocated (50 kW) ≤ Substation Limit (50 kW)
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#DDF3E4] text-[#1E6B3A] uppercase">
                        COMPLIANT
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#FAFAF9] border-t border-[#E8E8E6] text-[12px] text-[#737373]">
              <strong>Note on Verification Rigor (MASTER §11.2):</strong> All savings calculations maintain separate columns and are never merged into one fabricated &quot;savings&quot; metric. Everything is labelled simulated.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
