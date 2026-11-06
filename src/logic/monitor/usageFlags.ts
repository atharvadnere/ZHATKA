import { CONFIG } from '../../config/defaults.ts';
import { HardwareStatus, OccupancyState, UsageFlag } from '../../types/index.ts';

export interface UsageFlagParams {
  meterStatus: HardwareStatus;
  occupancyState: OccupancyState;
  powerKw: number;
  baselinePowerKw: number;
  highRatio?: number;
  highMinKw?: number;
  emptyExcessMinKw?: number;
}

/**
 * Usage Flag evaluation per MASTER.md §7.4
 * Precedence: EMPTY_BUT_CONSUMING wins over HIGH_USAGE if both match.
 */
export function evaluateUsageFlag({
  meterStatus,
  occupancyState,
  powerKw,
  baselinePowerKw,
  highRatio = CONFIG.highRatio,
  highMinKw = CONFIG.highMinKw,
  emptyExcessMinKw = CONFIG.emptyExcessMinKw,
}: UsageFlagParams): UsageFlag {
  if (meterStatus !== 'HEALTHY') {
    return 'NORMAL';
  }

  const excessKw = powerKw - baselinePowerKw;

  // 1. EMPTY_BUT_CONSUMING check
  if (occupancyState === 'VERIFIED_EMPTY' && excessKw >= emptyExcessMinKw) {
    return 'EMPTY_BUT_CONSUMING';
  }

  // 2. HIGH_USAGE check (only for rooms not flagged EMPTY_BUT_CONSUMING)
  if (powerKw >= highRatio * baselinePowerKw && excessKw >= highMinKw) {
    return 'HIGH_USAGE';
  }

  return 'NORMAL';
}
