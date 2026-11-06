import { HardwareStatus, OccupancyState, ScheduledStatus, ScheduleConflict, UnknownReason } from '../../types/index.ts';

export interface ResolveOccupancyParams {
  sensorStatus: HardwareStatus;
  occupancy: number | string | null | undefined;
  lastSeenTs: string | null | undefined;
  now: string | Date;
  freshnessMinutes?: number;
  scheduledStatus?: ScheduledStatus;
}

export interface ResolveOccupancyResult {
  state: OccupancyState;
  unknownReason: UnknownReason;
  count: number | null;
  ageMinutes: number | null;
  scheduleConflict: ScheduleConflict;
}

function minutesBetween(date1Iso: string | null | undefined, date2: string | Date): number | null {
  if (!date1Iso) return null;
  const d1 = new Date(date1Iso).getTime();
  const d2 = typeof date2 === 'string' ? new Date(date2).getTime() : date2.getTime();
  if (isNaN(d1) || isNaN(d2)) return null;
  return (d2 - d1) / (1000 * 60);
}

/**
 * Occupancy Resolver (MASTER.md §7.3)
 * Pure function; UNKNOWN is never coerced to zero.
 */
export function resolveOccupancy({
  sensorStatus,
  occupancy,
  lastSeenTs,
  now,
  freshnessMinutes = 60,
  scheduledStatus = 'UNKNOWN',
}: ResolveOccupancyParams): ResolveOccupancyResult {
  let state: OccupancyState = 'UNKNOWN';
  let unknownReason: UnknownReason = null;
  let count: number | null = null;
  let ageMinutes: number | null = null;

  if (sensorStatus === 'OFFLINE') {
    unknownReason = 'SENSOR_OFFLINE';
  } else if (sensorStatus === 'DEGRADED') {
    unknownReason = 'SENSOR_DEGRADED';
  } else if (occupancy === null || occupancy === undefined || occupancy === 'UNKNOWN' || occupancy === '') {
    unknownReason = 'NO_DATA';
  } else {
    ageMinutes = minutesBetween(lastSeenTs, now);
    
    // Check if occupancy is a valid non-negative integer
    const numOccupancy = typeof occupancy === 'number' ? occupancy : Number(occupancy);
    const isValidInt = Number.isInteger(numOccupancy) && numOccupancy >= 0 && !isNaN(numOccupancy);

    if (ageMinutes === null || isNaN(ageMinutes) || ageMinutes < -5) {
      // Missing or future timestamp (allow at most 5 minutes clock skew)
      unknownReason = 'INVALID_DATA';
    } else if (ageMinutes > freshnessMinutes) {
      unknownReason = 'STALE_DATA';
    } else if (!isValidInt) {
      unknownReason = 'INVALID_DATA';
    } else {
      count = numOccupancy;
      state = count > 0 ? 'OCCUPIED' : 'VERIFIED_EMPTY';
    }
  }

  const inSession = scheduledStatus === 'IN_SESSION' || scheduledStatus === 'EVENT';
  let scheduleConflict: ScheduleConflict = 'NONE';
  if (state === 'VERIFIED_EMPTY' && inSession) {
    scheduleConflict = 'SESSION_BUT_EMPTY';
  }
  if (state === 'OCCUPIED' && scheduledStatus === 'NO_SESSION') {
    scheduleConflict = 'NO_SESSION_BUT_OCCUPIED';
  }

  return { state, unknownReason, count, ageMinutes, scheduleConflict };
}
