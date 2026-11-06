import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Siren,
  Info,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAppState } from '../store/AppStateContext.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';

export const NotificationsAlerts: React.FC = () => {
  const {
    recommendations,
    setSelectedRoomId,
    setActivePage,
    approveRecommendation,
    rejectRecommendation,
    markFalseAlarm,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const activeAlerts = recommendations.filter(
    (r) => !resolvedIds.has(r.recommendationId) && (r.priority === 'CRITICAL' || r.priority === 'HIGH' || r.priority === 'MEDIUM')
  );

  const resolvedAlerts = recommendations.filter((r) => resolvedIds.has(r.recommendationId));

  const currentList = activeTab === 'active' ? activeAlerts : resolvedAlerts;
  const filteredList = currentList.filter((a) =>
    priorityFilter === 'ALL' ? true : a.priority === priorityFilter
  );

  const selectedAlert = recommendations.find((r) => r.recommendationId === selectedAlertId) || filteredList[0];

  const handleResolve = (id: string) => {
    setResolvedIds((prev) => new Set([...prev, id]));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Notifications & Operational Alerts"
        tag="SIMULATED"
        description="Real-time alert dispatch tracking high-consumption anomalies, sensor dropouts, and emergency priority shortages (DESIGN §6.11)."
        tabs={[
          { id: 'active', label: 'Active Alerts', count: activeAlerts.length },
          { id: 'history', label: 'Resolved History', count: resolvedAlerts.length },
        ]}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as any)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter & Alert List */}
        <div className="lg:col-span-5 space-y-3">
          {/* Priority Filter */}
          <div className="p-3 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[8px] flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Filter by Severity:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-[30px] px-2 text-[12px] border border-[var(--border)] dark:border-[#27272A] rounded-[6px] bg-[var(--bg)] dark:bg-[#18181B] text-[var(--text)]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (Red)</option>
              <option value="HIGH">High (Amber)</option>
              <option value="MEDIUM">Medium (Blue)</option>
            </select>
          </div>

          {/* List items per DESIGN.md §6.11: 56px rows with colour stripes */}
          <div className="space-y-2">
            {filteredList.length > 0 ? (
              filteredList.map((alert) => {
                const isSelected = selectedAlert?.recommendationId === alert.recommendationId;
                const isCritical = alert.priority === 'CRITICAL';
                const isHigh = alert.priority === 'HIGH';

                return (
                  <div
                    key={alert.recommendationId}
                    onClick={() => setSelectedAlertId(alert.recommendationId)}
                    className={`h-[68px] p-3 rounded-[8px] border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[var(--blue)] dark:border-[#38BDF8] bg-blue-50/50 dark:bg-[#1E293B]/70 shadow-xs'
                        : 'border-[var(--border)] dark:border-[#27272A] bg-[var(--bg)] dark:bg-[#121214] hover:bg-[var(--bg-hover)] dark:hover:bg-[#18181B]'
                    } ${
                      isCritical
                        ? 'border-l-4 border-l-[#D92D20]'
                        : isHigh
                        ? 'border-l-4 border-l-[#E0A03A]'
                        : 'border-l-4 border-l-[var(--blue)] dark:border-l-[#38BDF8]'
                    }`}
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-[var(--text)] truncate">
                          {alert.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                        {alert.reason}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] dark:bg-[#18181B] text-[var(--text-secondary)]">
                        {alert.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-[13px] text-[var(--text-secondary)] bg-[var(--bg)] dark:bg-[#121214] border border-[var(--border)] dark:border-[#27272A] rounded-[10px]">
                No alerts matching current filters.
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedAlert ? (
          <div className="lg:col-span-7 bg-[var(--bg)] border border-[var(--border)] dark:bg-[#121214] dark:border-[#27272A] rounded-[10px] p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] dark:border-[#27272A] pb-3">
              <div>
                <span className="font-mono text-[11px] font-bold text-[var(--blue-text)]">
                  {selectedAlert.recommendationId}
                </span>
                <h3 className="text-[16px] font-semibold text-[var(--text)] mt-0.5">
                  {selectedAlert.title}
                </h3>
              </div>
              <StatusBadge state={selectedAlert.priority} />
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <div className="font-semibold text-[var(--text)] mb-1">Alert Description</div>
                <p className="text-[var(--text-secondary)] leading-[18px]">{selectedAlert.reason}</p>
              </div>

              <div>
                <div className="font-semibold text-[var(--text)] mb-1">Recommended Response</div>
                <p className="text-[var(--text)] p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] rounded-[8px] leading-[18px]">
                  {selectedAlert.suggestedAction}
                </p>
              </div>

              {selectedAlert.roomId && (
                <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] dark:bg-[#18181B] border border-[var(--border)] dark:border-[#27272A] rounded-[8px]">
                  <span className="text-[var(--text-secondary)]">Associated Target Room:</span>
                  <button
                    onClick={() => {
                      setSelectedRoomId(selectedAlert.roomId!);
                    }}
                    className="font-mono font-bold text-[var(--blue-text)] hover:underline flex items-center gap-1"
                  >
                    <span>{selectedAlert.roomId}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border)] dark:border-[#27272A] flex items-center justify-between flex-wrap gap-2">
              <span className="text-[12px] text-[var(--text-secondary)]">
                Evaluated: {new Date(selectedAlert.createdAt).toLocaleTimeString('en-IN')}
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    markFalseAlarm(selectedAlert.recommendationId, 'Dismissed from notifications center.');
                    handleResolve(selectedAlert.recommendationId);
                  }}
                  className="h-[32px] px-3 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 transition-colors"
                  title="Mark as false alarm and dismiss"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>False Alarm</span>
                </button>

                <button
                  onClick={() => {
                    rejectRecommendation(selectedAlert.recommendationId, 'Rejected from notifications center.');
                    handleResolve(selectedAlert.recommendationId);
                  }}
                  className="h-[32px] px-3 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/60 transition-colors"
                >
                  Reject
                </button>

                <button
                  onClick={() => {
                    approveRecommendation(selectedAlert.recommendationId, 'Approved from notifications center.');
                    handleResolve(selectedAlert.recommendationId);
                  }}
                  className="h-[32px] px-3.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Action</span>
                </button>

                {!resolvedIds.has(selectedAlert.recommendationId) && (
                  <button
                    onClick={() => handleResolve(selectedAlert.recommendationId)}
                    className="h-[32px] px-3 text-xs font-medium bg-[var(--bg-secondary)] dark:bg-[#18181B] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] dark:border-[#27272A] rounded-lg transition-colors hover:bg-[var(--bg-hover)] dark:hover:bg-[#202024]"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
