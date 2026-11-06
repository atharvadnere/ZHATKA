import { PrimaryDisplayState, RoomRecord } from '../../types/index.ts';

export interface RoomStateProperties {
  maintenanceActive: boolean;
  isProtected: boolean;
  occupancyState: 'OCCUPIED' | 'VERIFIED_EMPTY' | 'UNKNOWN';
  usageFlag: 'NORMAL' | 'HIGH_USAGE' | 'EMPTY_BUT_CONSUMING';
}

/**
 * Derives primary display state per MASTER.md §7.2:
 * MAINTENANCE → PROTECTED → UNKNOWN → HIGH_USAGE → OCCUPIED → EMPTY
 * Notice: This is for visual rendering only. The safety engine never reads primary state.
 */
export function derivePrimaryState(props: RoomStateProperties): PrimaryDisplayState {
  if (props.maintenanceActive) {
    return 'MAINTENANCE';
  }
  if (props.isProtected) {
    return 'PROTECTED';
  }
  if (props.occupancyState === 'UNKNOWN') {
    return 'UNKNOWN';
  }
  if (props.usageFlag === 'HIGH_USAGE') {
    return 'HIGH_USAGE';
  }
  if (props.occupancyState === 'OCCUPIED') {
    return 'OCCUPIED';
  }
  return 'VERIFIED_EMPTY';
}

export function derivePrimaryStateForRoom(room: RoomRecord, isProtected: boolean): PrimaryDisplayState {
  return derivePrimaryState({
    maintenanceActive: room.maintenance.active,
    isProtected,
    occupancyState: room.occupancyState,
    usageFlag: room.usageFlag,
  });
}
