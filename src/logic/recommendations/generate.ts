import { CONFIG } from '../../config/defaults.ts';
import {
  AllocatedLoadItem,
  EquipmentRecord,
  RecommendationRecord,
  RoomRecord,
} from '../../types/index.ts';
import { evaluateSafety } from '../safety/evaluateSafety.ts';

export interface GenerateRecommendationsParams {
  rooms: RoomRecord[];
  equipment: EquipmentRecord[];
  loads?: AllocatedLoadItem[];
  existingRecommendations?: RecommendationRecord[];
  nowIso?: string;
}

export function generateRecommendations({
  rooms,
  equipment,
  loads = [],
  existingRecommendations = [],
  nowIso,
}: GenerateRecommendationsParams): RecommendationRecord[] {
  const now = nowIso || new Date().toISOString();
  const existingMap = new Map<string, RecommendationRecord>(
    existingRecommendations.map(r => [r.dedupeKey, r])
  );

  const newRecommendations: RecommendationRecord[] = [];
  let recCounter = existingRecommendations.length + 1;

  // 1. Process Rooms
  for (const room of rooms) {
    const roomProtectedEquipment = equipment.filter(
      e => e.roomId === room.roomId && e.active && e.protected
    );

    const safetyContext = {
      targetType: 'ROOM' as const,
      targetId: room.roomId,
      now,
      occupancy: {
        state: room.occupancyState,
        unknownReason: room.unknownReason,
        count: typeof room.occupancy === 'number' ? room.occupancy : null,
        ageMinutes: 2, // seed default 2 min
        scheduleConflict: room.scheduleConflict,
      },
      sensorStatus: room.sensorStatus,
      meterStatus: room.meterStatus,
      dataQuality: room.dataQuality,
      protectedEquipment: roomProtectedEquipment,
      maintenance: room.maintenance,
    };

    // 1a. REVIEW_EMPTY_ROOM_LOAD (for EMPTY_BUT_CONSUMING)
    if (room.usageFlag === 'EMPTY_BUT_CONSUMING') {
      const dedupeKey = `REVIEW_EMPTY_ROOM_LOAD|${room.roomId}|MONITOR`;
      const safetyResult = evaluateSafety(safetyContext, { type: 'REVIEW_EMPTY_ROOM_LOAD' });
      const excessKw = Math.max(0, room.powerKw - room.baselinePowerKw);
      const estSavingKwh = Math.round(excessKw * CONFIG.estimatedDurationHours * 10) / 10;

      let priority: RecommendationRecord['priority'] = 'MEDIUM';
      if (estSavingKwh >= 8) priority = 'HIGH';
      else if (estSavingKwh < 3) priority = 'LOW';

      const existing = existingMap.get(dedupeKey);
      const rec: RecommendationRecord = {
        recommendationId: existing?.recommendationId || `REC-${String(recCounter++).padStart(6, '0')}`,
        type: 'REVIEW_EMPTY_ROOM_LOAD',
        targetType: 'ROOM',
        roomId: room.roomId,
        title: `Review idle load in empty room ${room.roomId}`,
        reason: `Room verified empty but drawing ${room.powerKw} kW (${excessKw.toFixed(1)} kW above ${room.baselinePowerKw} kW baseline).`,
        evidence: {
          roomPowerKw: room.powerKw,
          baselinePowerKw: room.baselinePowerKw,
          excessKw,
          occupancyState: room.occupancyState,
          scheduledStatus: room.scheduledStatus,
          meterStatus: room.meterStatus,
        },
        suggestedAction: `Switch off unnecessary lighting and air conditioning in ${room.roomId} following verification.`,
        currentPowerKw: room.powerKw,
        baselinePowerKw: room.baselinePowerKw,
        estimatedSaving: {
          kwh: estSavingKwh,
          durationHours: CONFIG.estimatedDurationHours,
          status: 'ESTIMATED',
        },
        priority,
        dataQualityStatus: room.dataQuality,
        safetyStatus: safetyResult,
        approvalStatus: existing ? existing.approvalStatus : 'PENDING REVIEW',
        adminComment: existing?.adminComment,
        dedupeKey,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      newRecommendations.push(rec);
    }

    // 1b. INVESTIGATE_HIGH_USAGE (for HIGH_USAGE)
    if (room.usageFlag === 'HIGH_USAGE') {
      const dedupeKey = `INVESTIGATE_HIGH_USAGE|${room.roomId}|MONITOR`;
      const safetyResult = evaluateSafety(safetyContext, { type: 'INVESTIGATE_HIGH_USAGE' });
      const excessKw = Math.max(0, room.powerKw - room.baselinePowerKw);

      const existing = existingMap.get(dedupeKey);
      const rec: RecommendationRecord = {
        recommendationId: existing?.recommendationId || `REC-${String(recCounter++).padStart(6, '0')}`,
        type: 'INVESTIGATE_HIGH_USAGE',
        targetType: 'ROOM',
        roomId: room.roomId,
        title: `Inspect unusual high consumption in ${room.roomId}`,
        reason: `Room power draw is ${room.powerKw} kW, which is ${(room.powerKw / room.baselinePowerKw).toFixed(1)}x normal baseline. Inspection suggested.`,
        evidence: {
          roomPowerKw: room.powerKw,
          baselinePowerKw: room.baselinePowerKw,
          ratio: (room.powerKw / room.baselinePowerKw).toFixed(2),
          excessKw,
        },
        suggestedAction: `Conduct visual and thermal inspection of active equipment in ${room.roomId} for potential anomalies.`,
        currentPowerKw: room.powerKw,
        baselinePowerKw: room.baselinePowerKw,
        estimatedSaving: null,
        priority: 'MEDIUM',
        dataQualityStatus: room.dataQuality,
        safetyStatus: safetyResult,
        approvalStatus: existing ? existing.approvalStatus : 'PENDING REVIEW',
        adminComment: existing?.adminComment,
        dedupeKey,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      newRecommendations.push(rec);
    }

    // 1c. REQUEST_SENSOR_VERIFICATION (for UNKNOWN, schedule conflicts, or UNRELIABLE)
    const needsSensorVerification =
      room.occupancyState === 'UNKNOWN' ||
      room.scheduleConflict === 'SESSION_BUT_EMPTY' ||
      room.dataQuality === 'UNRELIABLE';

    if (needsSensorVerification) {
      const dedupeKey = `REQUEST_SENSOR_VERIFICATION|${room.roomId}|MONITOR`;
      const safetyResult = evaluateSafety(safetyContext, { type: 'REQUEST_SENSOR_VERIFICATION' });

      let reasonText = `Sensor telemetry requires field verification in room ${room.roomId}.`;
      if (room.occupancyState === 'UNKNOWN') {
        reasonText = `Occupancy cannot be determined (${room.unknownReason || 'SENSOR_OFFLINE'}). Automated shutdown held.`;
      } else if (room.scheduleConflict === 'SESSION_BUT_EMPTY') {
        reasonText = `Schedule conflict: class scheduled but sensor indicates 0 occupants. Field check required.`;
      } else if (room.dataQuality === 'UNRELIABLE') {
        reasonText = `Data quality quarantined or unreliable. Sensor inspection suggested.`;
      }

      const existing = existingMap.get(dedupeKey);
      const rec: RecommendationRecord = {
        recommendationId: existing?.recommendationId || `REC-${String(recCounter++).padStart(6, '0')}`,
        type: 'REQUEST_SENSOR_VERIFICATION',
        targetType: 'ROOM',
        roomId: room.roomId,
        title: `Verify sensor & telemetry in ${room.roomId}`,
        reason: reasonText,
        evidence: {
          occupancyState: room.occupancyState,
          unknownReason: room.unknownReason,
          scheduleConflict: room.scheduleConflict,
          dataQuality: room.dataQuality,
          sensorStatus: room.sensorStatus,
        },
        suggestedAction: `Inspect physical occupancy sensor or verify scheduled classroom presence manually.`,
        currentPowerKw: room.powerKw,
        baselinePowerKw: room.baselinePowerKw,
        estimatedSaving: null,
        priority: 'MEDIUM',
        dataQualityStatus: room.dataQuality,
        safetyStatus: safetyResult,
        approvalStatus: existing ? existing.approvalStatus : 'PENDING REVIEW',
        adminComment: existing?.adminComment,
        dedupeKey,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      newRecommendations.push(rec);
    }
  }

  // 2. Process Loads from Adaptive Planner
  for (const load of loads) {
    if (load.priority === 'P0' || load.protected) {
      continue; // INV-13: P0 and protected loads never receive reduction recommendations
    }

    if (load.status === 'REDUCED' || load.status === 'DEFERRED') {
      const dedupeKey = `APPLY_ALLOCATION_REDUCTION|${load.loadId}|PLANNER`;
      const safetyContext = {
        targetType: 'LOAD' as const,
        targetId: load.loadId,
        loadProtection: {
          priority: load.priority,
          protected: load.protected,
        },
        dataQuality: 'HEALTHY' as const,
      };

      const safetyResult = evaluateSafety(safetyContext, { type: 'APPLY_ALLOCATION_REDUCTION' });
      const reductionKw = load.unmetKw;
      const estSavingKwh = Math.round(reductionKw * CONFIG.emergencyDurationHours * 10) / 10;

      const existing = existingMap.get(dedupeKey);
      const rec: RecommendationRecord = {
        recommendationId: existing?.recommendationId || `REC-${String(recCounter++).padStart(6, '0')}`,
        type: 'APPLY_ALLOCATION_REDUCTION',
        targetType: 'LOAD',
        affectedLoadId: load.loadId,
        title: `Emergency reduction for ${load.loadName} (${load.priority})`,
        reason: `Deficit allocation plan throttles load from ${load.scaledRequestedKw} kW to ${load.allocatedKw} kW (saving ${reductionKw} kW).`,
        evidence: {
          priority: load.priority,
          requestedKw: load.scaledRequestedKw,
          allocatedKw: load.allocatedKw,
          minimumKw: load.effectiveMinKw,
          deferrable: load.deferrable,
          reductionConstraints: load.reductionConstraints,
        },
        suggestedAction: `Authorize temporary emergency reduction of ${load.loadName} to ${load.allocatedKw} kW.`,
        currentPowerKw: load.scaledRequestedKw,
        baselinePowerKw: load.allocatedKw,
        estimatedSaving: {
          kwh: estSavingKwh,
          durationHours: CONFIG.emergencyDurationHours,
          status: 'ESTIMATED',
        },
        priority: 'CRITICAL',
        dataQualityStatus: 'HEALTHY',
        safetyStatus: safetyResult,
        approvalStatus: existing ? existing.approvalStatus : 'PENDING REVIEW',
        adminComment: existing?.adminComment,
        dedupeKey,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      newRecommendations.push(rec);
    }
  }

  return newRecommendations;
}
