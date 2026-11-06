import React, { useState } from 'react';
import { useAppState } from '../../store/AppStateContext.tsx';
import { RecommendationRecord } from '../../types/index.ts';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  ArrowRight,
  X,
  Volume2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AlertPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertPopupModal: React.FC<AlertPopupModalProps> = ({ isOpen, onClose }) => {
  const {
    recommendations,
    approveRecommendation,
    rejectRecommendation,
    markFalseAlarm,
    setSelectedRoomId,
    setActivePage,
  } = useAppState();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'ENERGY'>('ALL');
  const [actionCommentPrompt, setActionCommentPrompt] = useState<{
    id: string;
    action: 'APPROVE' | 'REJECT' | 'FALSE_ALARM';
    title: string;
  } | null>(null);
  const [commentText, setCommentText] = useState('');

  if (!isOpen) return null;

  // Filter recommendations: show pending review alerts
  const pendingAlerts = recommendations.filter(
    (r) => r.approvalStatus === 'PENDING REVIEW'
  );

  const filteredAlerts = pendingAlerts.filter((r) => {
    if (activeFilter === 'CRITICAL') return r.priority === 'CRITICAL';
    if (activeFilter === 'HIGH') return r.priority === 'HIGH';
    if (activeFilter === 'ENERGY') return r.type === 'INVESTIGATE_HIGH_USAGE' || r.type === 'REVIEW_EMPTY_ROOM_LOAD';
    return true;
  });

  const criticalCount = pendingAlerts.filter((r) => r.priority === 'CRITICAL').length;
  const highCount = pendingAlerts.filter((r) => r.priority === 'HIGH').length;

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT' | 'FALSE_ALARM', title: string) => {
    setActionCommentPrompt({ id, action, title });
    setCommentText('');
  };

  const confirmAction = () => {
    if (!actionCommentPrompt) return;
    const { id, action } = actionCommentPrompt;

    if (action === 'APPROVE') {
      approveRecommendation(id, commentText || undefined);
    } else if (action === 'REJECT') {
      rejectRecommendation(id, commentText || undefined);
    } else if (action === 'FALSE_ALARM') {
      markFalseAlarm(id, commentText || 'Verified by admin on-site: sensor anomaly / false alarm.');
    }
    setActionCommentPrompt(null);
  };

  const inspectRoom = (roomId?: string | null) => {
    if (roomId) {
      setSelectedRoomId(roomId);
      setActivePage('rooms');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden dark:bg-[#12203A] dark:border-[#243557]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] dark:border-[#243557] flex items-center justify-between bg-[var(--bg-secondary)] dark:bg-[#0E1A30]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-950/60 rounded-lg text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[var(--text)]">
                  Campus Alert & Anomaly Dispatch Center
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                  {pendingAlerts.length} Active
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Real-time safety checks, power anomalies, and actionable campus energy alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#182A4A] rounded-md transition-colors"
              aria-label="Close alert modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-[var(--border)] dark:border-[#243557] bg-[var(--bg)] dark:bg-[#12203A] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-[var(--blue)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#182A4A]'
              }`}
            >
              All Alerts ({pendingAlerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#182A4A]'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setActiveFilter('HIGH')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'HIGH'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#182A4A]'
              }`}
            >
              High ({highCount})
            </button>
            <button
              onClick={() => setActiveFilter('ENERGY')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeFilter === 'ENERGY'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] dark:hover:bg-[#182A4A]'
              }`}
            >
              Energy Waste & Drain
            </button>
          </div>

          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            Live Telemetry Engine Connected
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 bg-[var(--bg-secondary)]/50 dark:bg-[#0B1426]/50">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg)] dark:bg-[#12203A] rounded-xl border border-[var(--border)] dark:border-[#243557]">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[var(--text)]">All Clear</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1">
                No active anomalies in this category. All campus rooms and equipment are operating within safety parameters.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.priority === 'CRITICAL';
              const isHigh = alert.priority === 'HIGH';

              return (
                <div
                  key={alert.recommendationId}
                  className={`p-4 rounded-xl border transition-all bg-[var(--bg)] dark:bg-[#12203A] ${
                    isCritical
                      ? 'border-red-300 dark:border-red-900/60 shadow-xs ring-1 ring-red-500/10'
                      : isHigh
                      ? 'border-amber-300 dark:border-amber-900/60 shadow-xs'
                      : 'border-[var(--border)] dark:border-[#243557]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                            isCritical
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                              : isHigh
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                          }`}
                        >
                          {alert.priority} PRIORITY
                        </span>

                        {alert.roomId && (
                          <button
                            onClick={() => inspectRoom(alert.roomId)}
                            className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-[var(--bg-secondary)] dark:bg-[#182A4A] text-[var(--text)] hover:underline flex items-center gap-1 border border-[var(--border)] dark:border-[#334B7A]"
                          >
                            <span>{alert.roomId}</span>
                            <ArrowRight className="w-3 h-3 text-[var(--text-secondary)]" />
                          </button>
                        )}

                        <span className="text-xs text-[var(--text-secondary)] font-mono">
                          ID: {alert.recommendationId}
                        </span>

                        <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-[var(--text)]">{alert.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {alert.reason}
                      </p>

                      {/* Evidence / Metrics row */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] dark:bg-[#0E1A30] border border-[var(--border)] dark:border-[#243557]">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[var(--text-secondary)]">Current:</span>
                          <span className="font-semibold text-[var(--text)] font-mono">
                            {alert.currentPowerKw} kW
                          </span>
                        </div>

                        {alert.estimatedSaving && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Potential Saving:</span>
                            <span className="font-semibold font-mono">
                              {alert.estimatedSaving.kwh} kWh
                            </span>
                          </div>
                        )}

                        <div className="text-[11px] text-[var(--text-secondary)]">
                          Suggested: <span className="font-medium text-[var(--text)]">{alert.suggestedAction}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: 3 Pillars (Approve, Reject, False Alarm) */}
                    <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border)] dark:border-[#243557]">
                      <button
                        onClick={() => handleAction(alert.recommendationId, 'APPROVE', alert.title)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        title="Approve recommended curtailment/action"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleAction(alert.recommendationId, 'REJECT', alert.title)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-secondary)] hover:bg-red-50 text-red-600 dark:text-red-400 dark:bg-[#182A4A] dark:hover:bg-red-950/50 border border-[var(--border)] dark:border-[#243557] flex items-center justify-center gap-1.5 transition-colors"
                        title="Reject action"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      {/* NEW: False Alarm Button */}
                      <button
                        onClick={() => handleAction(alert.recommendationId, 'FALSE_ALARM', alert.title)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center justify-center gap-1.5 transition-colors"
                        title="Dismiss as False Alarm (sensor drift, planned override)"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>False Alarm</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] dark:border-[#243557] bg-[var(--bg-secondary)] dark:bg-[#0E1A30] flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">
            Actions update room telemetry states and append to tamper-evident audit log.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium rounded-lg bg-[var(--bg)] dark:bg-[#182A4A] border border-[var(--border)] dark:border-[#334B7A] text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Close Alert Center
          </button>
        </div>

        {/* Reason / Confirmation Sub-modal */}
        {actionCommentPrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 max-w-md w-full shadow-2xl dark:bg-[#12203A] dark:border-[#243557] space-y-4">
              <div className="flex items-center gap-2">
                {actionCommentPrompt.action === 'APPROVE' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {actionCommentPrompt.action === 'REJECT' && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                {actionCommentPrompt.action === 'FALSE_ALARM' && (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <h4 className="text-sm font-semibold text-[var(--text)]">
                  Confirm {actionCommentPrompt.action === 'FALSE_ALARM' ? 'False Alarm' : actionCommentPrompt.action}
                </h4>
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                {actionCommentPrompt.action === 'FALSE_ALARM'
                  ? 'Marking as False Alarm records that this reading was verified as non-actionable or sensor noise. It will be dismissed from the active alert queue.'
                  : `Please confirm your decision for "${actionCommentPrompt.title}".`}
              </p>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Reason / Notes for Audit Trail (Optional):
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    actionCommentPrompt.action === 'FALSE_ALARM'
                      ? 'e.g., Sensor drifted; verified room is in regular lab use.'
                      : 'e.g., Approved after checking with lab supervisor.'
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] dark:border-[#334B7A] bg-[var(--bg)] dark:bg-[#0E1A30] text-[var(--text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--blue)] resize-none h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setActionCommentPrompt(null)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] dark:border-[#334B7A] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg text-white ${
                    actionCommentPrompt.action === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionCommentPrompt.action === 'REJECT'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirm & Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
