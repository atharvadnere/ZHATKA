import { CONFIG } from '../../config/defaults.ts';
import { EquipmentRecord, RoomRecord } from '../../types/index.ts';

export interface CampusKpis {
  totalDemandKw: number;
  meterOfflineCount: number;
  availableCapacityKw: number;
  potentiallyAvoidableKw: number;
  excludedPendingVerificationCount: number;
  occupiedRoomsCount: number;
  vacantRoomsCount: number;
  unknownRoomsCount: number;
  protectedRoomsCount: number;
  activeAlertsCount: number;
  estimatedSavingsKwh: number;
  estimatedCostSavingsInr: number;
  estimatedCo2AvoidedKg: number;
}

export function calculateCampusKpis(
  rooms: RoomRecord[],
  equipment: EquipmentRecord[],
  availableCapacityKw: number = CONFIG.originalCapacityKw,
  durationHours: number = CONFIG.estimatedDurationHours
): CampusKpis {
  let totalDemandKw = 0;
  let meterOfflineCount = 0;
  let potentiallyAvoidableKw = 0;
  let excludedPendingVerificationCount = 0;
  let occupiedRoomsCount = 0;
  let vacantRoomsCount = 0;
  let unknownRoomsCount = 0;
  let protectedRoomsCount = 0;
  let activeAlertsCount = 0;

  // Active protected room IDs
  const protectedRoomIds = new Set(
    equipment.filter(e => e.active && e.protected).map(e => e.roomId)
  );

  for (const room of rooms) {
    const isProtected = protectedRoomIds.has(room.roomId);
    if (isProtected) protectedRoomsCount++;

    // Total demand sum: only healthy or degraded meters
    if (room.meterStatus === 'HEALTHY' || room.meterStatus === 'DEGRADED') {
      totalDemandKw += room.powerKw;
    } else {
      meterOfflineCount++;
    }

    // Occupancy categories
    if (room.occupancyState === 'OCCUPIED') {
      occupiedRoomsCount++;
    } else if (room.occupancyState === 'VERIFIED_EMPTY') {
      vacantRoomsCount++;
    } else {
      unknownRoomsCount++;
    }

    // Alerts check
    if (room.usageFlag !== 'NORMAL' || room.scheduleConflict !== 'NONE' || room.dataQuality === 'UNRELIABLE') {
      activeAlertsCount++;
    }

    // Potentially avoidable consumption check (§7.5):
    // Flagged HIGH_USAGE or EMPTY_BUT_CONSUMING, AND NOT protected, NOT under maintenance, dataQuality !== UNRELIABLE
    // UNKNOWN occupancy and schedule conflict rooms are excluded pending verification
    const isFlagged = room.usageFlag === 'HIGH_USAGE' || room.usageFlag === 'EMPTY_BUT_CONSUMING';
    const isExcluded = 
      room.occupancyState === 'UNKNOWN' || 
      room.scheduleConflict === 'SESSION_BUT_EMPTY' || 
      room.dataQuality === 'UNRELIABLE' || 
      isProtected || 
      room.maintenance.active;

    if (isFlagged) {
      if (!isExcluded) {
        const excess = Math.max(0, room.powerKw - room.baselinePowerKw);
        potentiallyAvoidableKw += excess;
      } else {
        excludedPendingVerificationCount++;
      }
    }
  }

  // Estimated savings = potentially avoidable kW * durationHours
  const estimatedSavingsKwh = potentiallyAvoidableKw * durationHours;
  const estimatedCostSavingsInr = estimatedSavingsKwh * CONFIG.tariffPerKwhInr;
  const estimatedCo2AvoidedKg = estimatedSavingsKwh * CONFIG.emissionFactorKgPerKwh;

  return {
    totalDemandKw: Math.round(totalDemandKw * 100) / 100,
    meterOfflineCount,
    availableCapacityKw: Math.round(availableCapacityKw * 100) / 100,
    potentiallyAvoidableKw: Math.round(potentiallyAvoidableKw * 100) / 100,
    excludedPendingVerificationCount,
    occupiedRoomsCount,
    vacantRoomsCount,
    unknownRoomsCount,
    protectedRoomsCount,
    activeAlertsCount,
    estimatedSavingsKwh: Math.round(estimatedSavingsKwh * 10) / 10,
    estimatedCostSavingsInr: Math.round(estimatedCostSavingsInr),
    estimatedCo2AvoidedKg: Math.round(estimatedCo2AvoidedKg * 10) / 10,
  };
}
