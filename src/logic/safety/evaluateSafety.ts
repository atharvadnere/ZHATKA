import { CONFIG } from '../../config/defaults.ts';
import {
  DataQuality,
  EquipmentRecord,
  HardwareStatus,
  OccupancyState,
  SafetyCheck,
  SafetyDecision,
  SafetyResult,
  ScheduleConflict,
  UnknownReason,
} from '../../types/index.ts';

export const SHUTDOWN_CLASS = ['REVIEW_EMPTY_ROOM_LOAD', 'APPLY_ALLOCATION_REDUCTION'];
export const NON_INTRUSIVE_CLASS = ['INVESTIGATE_HIGH_USAGE', 'REQUEST_SENSOR_VERIFICATION'];

export interface SafetyContext {
  targetType: 'ROOM' | 'LOAD';
  targetId: string;
  now?: string | Date;
  occupancy?: {
    state: OccupancyState;
    unknownReason: UnknownReason;
    count: number | null;
    ageMinutes: number | null;
    scheduleConflict: ScheduleConflict;
  };
  sensorStatus?: HardwareStatus;
  meterStatus?: HardwareStatus;
  dataQuality?: DataQuality;
  protectedEquipment?: EquipmentRecord[];
  loadProtection?: {
    priority: string;
    protected: boolean;
  } | null;
  maintenance?: {
    active: boolean;
    until?: string | null;
  };
}

export interface ActionInput {
  type: string;
}

function unknownReasonToCode(reason: UnknownReason): string {
  switch (reason) {
    case 'SENSOR_OFFLINE': return 'SENSOR_OFFLINE';
    case 'SENSOR_DEGRADED': return 'SENSOR_DEGRADED';
    case 'STALE_DATA': return 'OCCUPANCY_STALE';
    case 'INVALID_DATA': return 'OCCUPANCY_INVALID';
    case 'NO_DATA':
    default:
      return 'OCCUPANCY_UNKNOWN';
  }
}

/**
 * Pure Safety Decision Engine (MASTER.md §10.4)
 * First failing check wins. Missing input fails closed.
 */
export function evaluateSafety(context: SafetyContext, action: ActionInput): SafetyResult {
  const evaluatedAt = new Date().toISOString();
  const checks: SafetyCheck[] = [];

  // Check 0: Input validation
  const hasValidTarget = !!context && !!action && !!context.targetId;
  const isRoom = context?.targetType === 'ROOM';
  const hasRoomOccupancy = !isRoom || !!context?.occupancy;

  if (!hasValidTarget || !hasRoomOccupancy) {
    checks.push({
      id: 'input_integrity',
      label: 'Input Data Integrity',
      status: 'FAIL',
      detail: 'Safety evaluation aborted: missing required context or target identifier.',
    });
    return {
      eligible: false,
      decision: 'HOLD',
      reasonCode: 'INVALID_INPUT',
      explanation: 'Required target context or occupancy payload is missing. Evaluation failed closed.',
      requiredAction: 'FIX_DATA',
      targetId: context?.targetId || 'UNKNOWN',
      actionType: action?.type || 'UNKNOWN',
      checks,
      evidence: { context, action },
      evaluatedAt,
    };
  }

  checks.push({
    id: 'input_integrity',
    label: 'Input Data Integrity',
    status: 'PASS',
    detail: 'Target context and identifiers verified.',
  });

  // Non-intrusive action classification check
  if (NON_INTRUSIVE_CLASS.includes(action.type)) {
    const isMaintenance = context.maintenance?.active;
    const note = isMaintenance
      ? 'Maintenance is currently in progress. Advisory and inspection actions are permitted.'
      : 'Action is observational and does not modify electrical or power state.';

    checks.push({
      id: 'non_intrusive',
      label: 'Non-Intrusive Classification',
      status: 'PASS',
      detail: note,
    });

    return {
      eligible: true,
      decision: 'PERMITTED_NON_INTRUSIVE',
      reasonCode: 'NON_INTRUSIVE_ACTION',
      explanation: note,
      requiredAction: 'NONE',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { targetId: context.targetId, actionType: action.type },
      evaluatedAt,
    };
  }

  // Ensure action is a recognized shutdown-class action
  if (!SHUTDOWN_CLASS.includes(action.type)) {
    checks.push({
      id: 'action_classification',
      label: 'Action Classification',
      status: 'FAIL',
      detail: `Unrecognised action type: ${action.type}`,
    });
    return {
      eligible: false,
      decision: 'HOLD',
      reasonCode: 'INVALID_INPUT',
      explanation: `Action type '${action.type}' is unrecognized.`,
      requiredAction: 'FIX_DATA',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: {},
      evaluatedAt,
    };
  }

  // 1. Protection is absolute and checked FIRST (INV-4, INV-13)
  const activeProtected = (context.protectedEquipment || []).filter(e => e.active && e.protected);
  const isProtectedRoom = activeProtected.length > 0;
  const isProtectedLoad = context.loadProtection && (context.loadProtection.protected || context.loadProtection.priority === 'P0');

  if (isProtectedRoom || isProtectedLoad) {
    const reasonDetail = isProtectedRoom
      ? `Room contains protected essential equipment (${activeProtected.map(e => `${e.name} [${e.category}]`).join(', ')}). Shutdown actions strictly barred.`
      : `Load is classified as P0 Critical or explicitly marked protected. Cannot be reduced.`;

    checks.push({
      id: 'shield_protection',
      label: 'Critical Equipment Shield',
      status: 'FAIL',
      detail: reasonDetail,
    });

    return {
      eligible: false,
      decision: 'PROTECT',
      reasonCode: 'PROTECTED_ESSENTIAL_EQUIPMENT',
      explanation: reasonDetail,
      requiredAction: 'NONE_INVESTIGATE_ONLY',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: {
        protectedEquipment: activeProtected,
        loadProtection: context.loadProtection,
      },
      evaluatedAt,
    };
  }

  checks.push({
    id: 'shield_protection',
    label: 'Critical Equipment Shield',
    status: 'PASS',
    detail: 'No active protected equipment or P0 critical load attached.',
  });

  // 2. Maintenance check (INV-5)
  if (context.maintenance?.active) {
    checks.push({
      id: 'maintenance_check',
      label: 'Maintenance Window',
      status: 'FAIL',
      detail: 'Target is undergoing active maintenance. Automated control recommendations suppressed.',
    });
    return {
      eligible: false,
      decision: 'SUPPRESS',
      reasonCode: 'MAINTENANCE_ACTIVE',
      explanation: 'Maintenance flag is currently active on this room. Conflicting control actions suppressed.',
      requiredAction: 'NONE_WAIT_FOR_WINDOW_END',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { maintenance: context.maintenance },
      evaluatedAt,
    };
  }

  checks.push({
    id: 'maintenance_check',
    label: 'Maintenance Window',
    status: 'PASS',
    detail: 'No active maintenance lockout.',
  });

  // Handling LOAD targets (planner reductions)
  if (context.targetType === 'LOAD') {
    if (context.dataQuality === 'UNRELIABLE') {
      checks.push({
        id: 'data_quality',
        label: 'Data Integrity & Quality',
        status: 'FAIL',
        detail: 'Underlying data telemetry feeding the scenario is quarantined or unreliable.',
      });
      return {
        eligible: false,
        decision: 'HOLD',
        reasonCode: 'DATA_UNRELIABLE',
        explanation: 'Scenario input data is marked UNRELIABLE. Held pending data verification.',
        requiredAction: 'FIX_OR_REVALIDATE_DATA',
        targetId: context.targetId,
        actionType: action.type,
        checks,
        evidence: { dataQuality: context.dataQuality },
        evaluatedAt,
      };
    }

    checks.push({
      id: 'data_quality',
      label: 'Data Integrity & Quality',
      status: 'PASS',
      detail: 'Data quality healthy for load allocation review.',
    });

    return {
      eligible: true,
      decision: 'ELIGIBLE_FOR_REVIEW',
      reasonCode: 'ELIGIBLE_FOR_ADMIN_REVIEW',
      explanation: 'Load reduction proposal passed all safety constraints and requires administrator sign-off.',
      requiredAction: 'HUMAN_APPROVAL',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { load: context.targetId },
      evaluatedAt,
    };
  }

  // 3. Data quality check for rooms
  if (context.dataQuality === 'UNRELIABLE' || context.meterStatus === 'OFFLINE') {
    const detail = context.meterStatus === 'OFFLINE'
      ? 'Power meter is currently OFFLINE. Power readings are unreliable.'
      : 'Latest uploaded telemetry was quarantined or rejected due to corruption or malicious payload.';

    checks.push({
      id: 'data_quality',
      label: 'Data Integrity & Quality',
      status: 'FAIL',
      detail,
    });

    return {
      eligible: false,
      decision: 'HOLD',
      reasonCode: 'DATA_UNRELIABLE',
      explanation: detail,
      requiredAction: 'FIX_OR_REVALIDATE_DATA',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { dataQuality: context.dataQuality, meterStatus: context.meterStatus },
      evaluatedAt,
    };
  }

  checks.push({
    id: 'data_quality',
    label: 'Data Integrity & Quality',
    status: 'PASS',
    detail: 'Telemetry data quality is verified healthy.',
  });

  // 4. Occupancy checks (INV-1, INV-2, INV-3, INV-6)
  const occ = context.occupancy!;

  // 4a. UNKNOWN occupancy check
  if (occ.state === 'UNKNOWN') {
    const code = unknownReasonToCode(occ.unknownReason);
    const detail = `Occupancy cannot be verified (${occ.unknownReason || 'NO_DATA'}). Absence of data is not absence of people.`;

    checks.push({
      id: 'occupancy_verification',
      label: 'Occupancy Verification',
      status: 'FAIL',
      detail,
    });

    return {
      eligible: false,
      decision: 'HOLD',
      reasonCode: code,
      explanation: detail,
      requiredAction: 'SENSOR_VERIFICATION',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { occupancy: occ },
      evaluatedAt,
    };
  }

  // 4b. Freshness check (INV-2)
  if (occ.ageMinutes === null || occ.ageMinutes > CONFIG.freshnessMinutes) {
    const detail = `Occupancy reading is stale (${occ.ageMinutes !== null ? Math.round(occ.ageMinutes) : 'N/A'} min old > ${CONFIG.freshnessMinutes} min limit).`;
    checks.push({
      id: 'occupancy_freshness',
      label: 'Occupancy Freshness',
      status: 'FAIL',
      detail,
    });
    return {
      eligible: false,
      decision: 'HOLD',
      reasonCode: 'OCCUPANCY_STALE',
      explanation: detail,
      requiredAction: 'SENSOR_VERIFICATION',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { occupancy: occ },
      evaluatedAt,
    };
  }

  // 4c. Schedule conflict check (INV-6)
  if (occ.scheduleConflict === 'SESSION_BUT_EMPTY') {
    const detail = 'Timetable indicates class or event in session, but sensor reports room empty. Discrepancy requires manual check.';
    checks.push({
      id: 'schedule_alignment',
      label: 'Timetable Alignment',
      status: 'FAIL',
      detail,
    });
    return {
      eligible: false,
      decision: 'HOLD',
      reasonCode: 'CONFLICT_SESSION_BUT_EMPTY',
      explanation: detail,
      requiredAction: 'MANUAL_VERIFICATION',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { occupancy: occ },
      evaluatedAt,
    };
  }

  // 4d. Occupied room check (INV-3)
  if (occ.state === 'OCCUPIED') {
    const detail = `Room is currently occupied (${occ.count} people detected). Power must be maintained.`;
    checks.push({
      id: 'occupancy_presence',
      label: 'Occupancy Presence',
      status: 'FAIL',
      detail,
    });
    return {
      eligible: false,
      decision: 'KEEP_ON',
      reasonCode: 'OCCUPIED',
      explanation: detail,
      requiredAction: 'NONE',
      targetId: context.targetId,
      actionType: action.type,
      checks,
      evidence: { occupancy: occ },
      evaluatedAt,
    };
  }

  checks.push({
    id: 'occupancy_verified',
    label: 'Occupancy & Schedule Verification',
    status: 'PASS',
    detail: 'Room confirmed verified empty, reading is fresh, and no timetable conflict detected.',
  });

  // All checks passed!
  return {
    eligible: true,
    decision: 'ELIGIBLE_FOR_REVIEW',
    reasonCode: 'ELIGIBLE_FOR_ADMIN_REVIEW',
    explanation: 'Room is verified empty, unreserved, unprotected, and within safe parameters. Eligible for administrator review.',
    requiredAction: 'HUMAN_APPROVAL',
    targetId: context.targetId,
    actionType: action.type,
    checks,
    evidence: {
      occupancy: occ,
      sensorStatus: context.sensorStatus,
      meterStatus: context.meterStatus,
    },
    evaluatedAt,
  };
}
