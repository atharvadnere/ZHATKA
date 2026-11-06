import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  Zap,
  Users,
} from 'lucide-react';
import { useAppState } from '../../store/AppStateContext.tsx';
import { StatusBadge } from '../common/StatusBadge.tsx';
import { DataNatureTag } from '../common/DataNatureTag.tsx';
import { SafetyChecklist } from '../common/SafetyChecklist.tsx';
import { EvidencePanel } from '../common/EvidencePanel.tsx';
import { evaluateSafety } from '../../logic/safety/evaluateSafety.ts';
import { derivePrimaryStateForRoom } from '../../logic/monitor/derivePrimaryState.ts';

export const RoomDrawer: React.FC = () => {
  const {
    selectedRoomId,
    setSelectedRoomId,
    rooms,
    equipment,
    recommendations,
    toggleRoomMaintenance,
    toggleEquipmentProtection,
    approveRecommendation,
    rejectRecommendation,
    markFalseAlarm,
    applyRecommendation,
    verifySavings,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'safety' | 'telemetry'>('overview');

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRoomId) {
        setSelectedRoomId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRoomId, setSelectedRoomId]);

  if (!selectedRoomId) return null;

  const room = rooms.find((r) => r.roomId === selectedRoomId);
  if (!room) return null;

  const roomEquipment = equipment.filter((e) => e.roomId === room.roomId);
  const isProtected = roomEquipment.some((e) => e.active && e.protected);
  const primaryState = derivePrimaryStateForRoom(room, isProtected);

  const activeRecs = recommendations.filter((r) => r.roomId === room.roomId);

  // Evaluate safety for REVIEW_EMPTY_ROOM_LOAD for "Why not?" explanation (§7.7)
  const safetyEval = evaluateSafety(
    {
      targetType: 'ROOM',
      targetId: room.roomId,
      occupancy: {
        state: room.occupancyState,
        unknownReason: room.unknownReason,
        count: typeof room.occupancy === 'number' ? room.occupancy : null,
        ageMinutes: 2,
        scheduleConflict: room.scheduleConflict,
      },
      sensorStatus: room.sensorStatus,
      meterStatus: room.meterStatus,
      dataQuality: room.dataQuality,
      protectedEquipment: roomEquipment.filter((e) => e.active && e.protected),
      maintenance: room.maintenance,
    },
    { type: 'REVIEW_EMPTY_ROOM_LOAD' }
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#202124]/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[480px] bg-white h-full border-l border-[#E8E8E6] shadow-[0_4px_16px_rgba(32,33,36,0.12)] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E8E8E6] flex items-start justify-between gap-4 bg-[#FAFAF9]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] font-bold text-[#3478D4] px-1.5 py-0.5 bg-[#EAF2FC] rounded">
                {room.roomId}
              </span>
              <h2 className="text-[16px] font-semibold text-[#202124]">
                {room.roomName}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[12px] text-[#737373]">
              <span>Building {room.buildingId}</span>
              <span>·</span>
              <span>{room.roomType}</span>
              <span>·</span>
              <StatusBadge state={primaryState} />
            </div>
          </div>
          <button
            onClick={() => setSelectedRoomId(null)}
            className="p-1 rounded-md text-[#737373] hover:text-[#202124] hover:bg-[#F1F1EF] transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-[#E8E8E6] flex gap-4 text-[13px] font-medium bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#3478D4] text-[#1F5FB0]'
                : 'border-transparent text-[#737373] hover:text-[#202124]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'safety'
                ? 'border-[#3478D4] text-[#1F5FB0]'
                : 'border-transparent text-[#737373] hover:text-[#202124]'
            }`}
          >
            Safety & Constraints
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'telemetry'
                ? 'border-[#3478D4] text-[#1F5FB0]'
                : 'border-transparent text-[#737373] hover:text-[#202124]'
            }`}
          >
            Readings & Evidence
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Power & Occupancy Stat Box */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F7F5] border border-[#E8E8E6] rounded-[10px]">
                <div>
                  <div className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-0.5">
                    Current Power
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-[24px] font-semibold text-[#202124] tabular-nums">
                      {room.powerKw}
                    </span>
                    <span className="text-[12px] text-[#737373]">kW</span>
                  </div>
                  <div className="text-[11px] text-[#737373] mt-0.5">
                    Baseline: {room.baselinePowerKw} kW (Max: {room.maxPowerKw} kW)
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-0.5">
                    Occupancy Status
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-[24px] font-semibold text-[#202124] tabular-nums">
                      {room.occupancy === 'UNKNOWN' ? '?' : room.occupancy}
                    </span>
                    <span className="text-[12px] text-[#737373]">/ {room.roomCapacity} cap</span>
                  </div>
                  <div className="text-[11px] text-[#737373] mt-0.5 truncate">
                    {room.unknownReason ? `Reason: ${room.unknownReason}` : `${room.occupancyState}`}
                  </div>
                </div>
              </div>

              {/* Status & Flags Overview */}
              <div className="space-y-2 border border-[#E8E8E6] rounded-[8px] p-3 text-[13px]">
                <div className="flex items-center justify-between py-1 border-b border-[#F1F1EF]">
                  <span className="text-[#737373]">Occupancy Sensor</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${room.sensorStatus === 'HEALTHY' ? 'bg-[#2F9E5B]' : 'bg-[#D92D20]'}`} />
                    {room.sensorStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#F1F1EF]">
                  <span className="text-[#737373]">Electricity Meter</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${room.meterStatus === 'HEALTHY' ? 'bg-[#2F9E5B]' : 'bg-[#D92D20]'}`} />
                    {room.meterStatus} ({room.meterType})
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#F1F1EF]">
                  <span className="text-[#737373]">Timetable Schedule</span>
                  <span className="font-medium text-[#202124]">
                    {room.scheduledStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#737373]">Data Quality</span>
                  <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                    room.dataQuality === 'HEALTHY'
                      ? 'bg-[#DDF3E4] text-[#1E6B3A]'
                      : room.dataQuality === 'WARNING'
                      ? 'bg-[#FFF1D6] text-[#8A5A00]'
                      : 'bg-[#FCE4E4] text-[#B42318]'
                  }`}>
                    {room.dataQuality}
                  </span>
                </div>
              </div>

              {/* Maintenance Control */}
              <div className="p-3 border border-[#E8E8E6] rounded-[8px] bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#E0A03A]" />
                    <span className="text-[13px] font-semibold text-[#202124]">
                      Maintenance Lockout
                    </span>
                  </div>
                  <button
                    onClick={() => toggleRoomMaintenance(room.roomId, !room.maintenance.active)}
                    className={`h-[28px] px-3 rounded-[6px] text-[12px] font-medium transition-colors ${
                      room.maintenance.active
                        ? 'bg-[#FFF1D6] text-[#8A5A00] border border-[#E0A03A]'
                        : 'bg-[#F7F7F5] text-[#202124] border border-[#D4D4D1] hover:bg-[#F1F1EF]'
                    }`}
                  >
                    {room.maintenance.active ? 'Active (Clear)' : 'Set Maintenance'}
                  </button>
                </div>
                <p className="text-[12px] text-[#737373] mt-1.5 leading-[16px]">
                  Setting maintenance suppresses automated shutdown recommendations and marks room unavailable for bookings.
                </p>
              </div>

              {/* Active Recommendations for Room */}
              {activeRecs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[13px] font-semibold text-[#202124]">
                    Active Energy Recommendations ({activeRecs.length})
                  </h3>
                  {activeRecs.map((rec) => (
                    <div
                      key={rec.recommendationId}
                      className="p-3 border border-[#E8E8E6] rounded-[8px] bg-[#FAFAF9]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[13px] font-semibold text-[#202124]">
                          {rec.title}
                        </div>
                        <StatusBadge state={rec.safetyStatus.decision} />
                      </div>
                      <p className="text-[12px] text-[#737373] mt-1">
                        {rec.suggestedAction}
                      </p>
                      {rec.estimatedSaving && (
                        <div className="mt-2 flex items-center gap-2 text-[12px]">
                          <span className="text-[#737373]">Estimated Saving:</span>
                          <span className="font-mono font-semibold text-[#1F5FB0]">
                            {rec.estimatedSaving.kwh} kWh
                          </span>
                          <DataNatureTag nature="ESTIMATED" />
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {rec.approvalStatus === 'PENDING REVIEW' && (
                          <>
                            {rec.safetyStatus.eligible && (
                              <button
                                onClick={() => approveRecommendation(rec.recommendationId)}
                                className="h-[28px] px-3 text-[12px] font-semibold bg-emerald-600 text-white rounded-[6px] hover:bg-emerald-700 shadow-xs transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => rejectRecommendation(rec.recommendationId, 'Rejected from Room Drawer')}
                              className="h-[28px] px-2.5 text-[12px] font-medium text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-[6px] hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => markFalseAlarm(rec.recommendationId, 'Dismissed as false alarm from Room Drawer')}
                              className="h-[28px] px-2.5 text-[12px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-[6px] hover:bg-amber-100 transition-colors flex items-center gap-1"
                              title="Dismiss as False Alarm"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>False Alarm</span>
                            </button>
                          </>
                        )}
                        {rec.approvalStatus === 'FALSE_ALARM' && (
                          <span className="text-[12px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Dismissed as False Alarm
                          </span>
                        )}
                        {rec.approvalStatus === 'APPROVED' && (
                          <button
                            onClick={() => applyRecommendation(rec.recommendationId)}
                            className="h-[28px] px-3 text-[12px] font-medium bg-[#1E6B3A] text-white rounded-[6px] hover:bg-[#16542d]"
                          >
                            Apply (Simulated)
                          </button>
                        )}
                        {rec.approvalStatus === 'COMPLETED' && (
                          <button
                            onClick={() => verifySavings(rec.recommendationId)}
                            className="h-[28px] px-3 text-[12px] font-medium bg-[#3478D4] text-white rounded-[6px] hover:bg-[#2A67BC]"
                          >
                            Verify Savings
                          </button>
                        )}
                        {rec.approvalStatus === 'VERIFIED' && (
                          <span className="text-[12px] font-medium text-[#1E6B3A] flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4">
              {/* "Why Not?" / Safety Gate Evaluation */}
              <div className="p-3.5 bg-[#FAFAF9] border border-[#E8E8E6] rounded-[8px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-semibold text-[#202124]">
                    Safety Gate Decision
                  </span>
                  <StatusBadge state={safetyEval.decision} />
                </div>
                <div className="text-[13px] text-[#202124] font-medium">
                  {safetyEval.explanation}
                </div>
                <div className="text-[11px] font-mono text-[#737373] mt-1">
                  Reason Code: {safetyEval.reasonCode} · Required Action: {safetyEval.requiredAction}
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#737373] mb-2">
                  Pre-Action Safety Checklist (MASTER §10.4)
                </h4>
                <SafetyChecklist checks={safetyEval.checks} />
              </div>

              {/* Protected Equipment Shield in this room */}
              <div className="border border-[#E8E8E6] rounded-[8px] p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#8B6FD0]" />
                    <span className="text-[13px] font-semibold text-[#202124]">
                      Protected Equipment in Room
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#737373]">
                    {roomEquipment.length} registered
                  </span>
                </div>

                {roomEquipment.length > 0 ? (
                  <div className="space-y-2">
                    {roomEquipment.map((eq) => (
                      <div
                        key={eq.equipmentId}
                        className="p-2.5 bg-[#F7F7F5] rounded-[6px] border border-[#E8E8E6] flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="text-[12px] font-semibold text-[#202124]">
                            {eq.name} ({eq.category})
                          </div>
                          <div className="text-[11px] text-[#737373] mt-0.5">
                            {eq.reasonForProtection}
                          </div>
                          <div className="text-[11px] font-mono text-[#5B3FA8] mt-0.5">
                            Min floor: {eq.minimumOperatingKw} kW
                          </div>
                        </div>
                        <button
                          onClick={() => toggleEquipmentProtection(eq.equipmentId)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                            eq.protected
                              ? 'bg-[#EEE7FA] text-[#5B3FA8] hover:bg-[#d8c8f5]'
                              : 'bg-[#F1F1EF] text-[#737373] hover:text-[#202124]'
                          }`}
                        >
                          {eq.protected ? 'Protected' : 'Unprotected'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#737373]">
                    No protected critical equipment registered in this room.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <EvidencePanel
                evidence={{
                  roomId: room.roomId,
                  buildingId: room.buildingId,
                  occupancy: room.occupancy,
                  occupancyState: room.occupancyState,
                  unknownReason: room.unknownReason,
                  powerKw: room.powerKw,
                  baselinePowerKw: room.baselinePowerKw,
                  previousPowerKw: room.previousPowerKw,
                  maxPowerKw: room.maxPowerKw,
                  meterType: room.meterType,
                  meterStatus: room.meterStatus,
                  sensorStatus: room.sensorStatus,
                  scheduleStatus: room.scheduledStatus,
                  scheduleConflict: room.scheduleConflict,
                  dataQuality: room.dataQuality,
                  simulatedState: room.simulatedPowerState,
                  lastSeenTs: room.timestamp,
                }}
                defaultExpanded={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E8E6] bg-[#FAFAF9] flex items-center justify-between text-[12px] text-[#737373]">
          <span className="font-mono">Last Reading: 2 min ago</span>
          <button
            onClick={() => setSelectedRoomId(null)}
            className="h-[32px] px-4 text-[13px] font-medium bg-white border border-[#D4D4D1] text-[#202124] rounded-[8px] hover:bg-[#F1F1EF]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
