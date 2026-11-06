// ZHATKA Core Type Definitions (MASTER.md and DESIGN.md)

export type OccupancyState = 'OCCUPIED' | 'VERIFIED_EMPTY' | 'UNKNOWN';

export type UnknownReason = 
  | 'SENSOR_OFFLINE' 
  | 'SENSOR_DEGRADED' 
  | 'STALE_DATA' 
  | 'INVALID_DATA' 
  | 'NO_DATA' 
  | null;

export type HardwareStatus = 'HEALTHY' | 'DEGRADED' | 'OFFLINE';

export type MeterType = 'UNIDIRECTIONAL' | 'BIDIRECTIONAL';

export type ScheduledStatus = 'IN_SESSION' | 'NO_SESSION' | 'EVENT' | 'UNKNOWN';

export type ScheduleConflict = 'NONE' | 'SESSION_BUT_EMPTY' | 'NO_SESSION_BUT_OCCUPIED';

export type UsageFlag = 'NORMAL' | 'HIGH_USAGE' | 'EMPTY_BUT_CONSUMING';

export type DataQuality = 'HEALTHY' | 'WARNING' | 'UNRELIABLE';

export type PrimaryDisplayState = 
  | 'MAINTENANCE' 
  | 'PROTECTED' 
  | 'UNKNOWN' 
  | 'HIGH_USAGE' 
  | 'OCCUPIED' 
  | 'VERIFIED_EMPTY';

export type LoadPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type EquipmentCategory = 
  | 'SERVER' 
  | 'NETWORK' 
  | 'LAB_ESSENTIAL' 
  | 'SAFETY_SYSTEM' 
  | 'SECURITY' 
  | 'OTHER';

export type ValidationClass = 
  | 'ACCEPTED' 
  | 'WARNING' 
  | 'DUPLICATE' 
  | 'REJECTED' 
  | 'QUARANTINED';

export type SafetyDecision = 
  | 'ELIGIBLE_FOR_REVIEW' 
  | 'HOLD' 
  | 'PROTECT' 
  | 'SUPPRESS' 
  | 'KEEP_ON' 
  | 'PERMITTED_NON_INTRUSIVE';

export type RecommendationType = 
  | 'REVIEW_EMPTY_ROOM_LOAD' 
  | 'INVESTIGATE_HIGH_USAGE' 
  | 'REQUEST_SENSOR_VERIFICATION' 
  | 'APPLY_ALLOCATION_REDUCTION';

export type RecommendationStatus = 
  | 'PENDING REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'FALSE_ALARM'
  | 'COMPLETED' 
  | 'VERIFIED'
  | 'SUPERSEDED';

export type SeverityLevel = 'NORMAL' | 'CAUTION' | 'SHORTAGE' | 'SEVERE';

export interface EmergencyScenarioPreset {
  id: string;
  name: string;
  description: string;
  baselineDemandKw: number;
  multiplier: number;
  capacityPercent: number;
  emergencyDurationHours: number;
  isCustom?: boolean;
}

export interface RoomRecord {
  roomId: string;
  buildingId: string;
  roomName: string;
  roomType: string;
  roomCapacity: number;
  occupancy: number | 'UNKNOWN' | null;
  occupancyState: OccupancyState;
  unknownReason: UnknownReason;
  powerKw: number;
  baselinePowerKw: number;
  previousPowerKw: number;
  maxPowerKw: number;
  meterType: MeterType;
  meterStatus: HardwareStatus;
  sensorStatus: HardwareStatus;
  equipmentList: string[];
  scheduledStatus: ScheduledStatus;
  scheduleConflict: ScheduleConflict;
  usageFlag: UsageFlag;
  dataQuality: DataQuality;
  maintenance: {
    active: boolean;
    until?: string | null;
  };
  simulatedPowerState: 'NORMAL' | 'REDUCED';
  timestamp: string;
}

export interface EquipmentRecord {
  equipmentId: string;
  name: string;
  buildingId: string;
  roomId: string;
  category: EquipmentCategory;
  protected: boolean;
  active: boolean;
  minimumOperatingKw: number;
  reasonForProtection: string;
}

export interface LoadRecord {
  loadId: string;
  buildingId: string;
  roomId: string;
  loadName: string;
  priority: LoadPriority;
  requestedKw: number;
  minimumKw: number;
  protected: boolean;
  deferrable: boolean;
  reductionConstraints?: string;
  operationalNotes?: string;
  sortOrder: number;
  simulatedAllocatedKw?: number | null;
}

export interface SafetyCheck {
  id: string;
  label: string;
  status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  detail: string;
}

export interface SafetyResult {
  eligible: boolean;
  decision: SafetyDecision;
  reasonCode: string;
  explanation: string;
  requiredAction: string;
  targetId: string;
  actionType: string;
  checks: SafetyCheck[];
  evidence: Record<string, any>;
  evaluatedAt: string;
}

export interface RecommendationRecord {
  recommendationId: string;
  type: RecommendationType;
  targetType: 'ROOM' | 'LOAD';
  affectedLoadId?: string | null;
  roomId?: string | null;
  title: string;
  reason: string;
  evidence: Record<string, any>;
  suggestedAction: string;
  currentPowerKw: number;
  baselinePowerKw: number;
  estimatedSaving: {
    kwh: number;
    durationHours: number;
    status: 'ESTIMATED';
  } | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dataQualityStatus: DataQuality;
  safetyStatus: SafetyResult;
  approvalStatus: RecommendationStatus;
  adminComment?: string;
  dedupeKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRecord {
  eventId: string;
  recommendationId: string | null;
  target: string | null;
  action: string;
  requestedAction?: string;
  approvalStatus?: string;
  actor: string;
  timestamp: string;
  reason: string;
  beforeReading?: Record<string, any> | null;
  afterReading?: Record<string, any> | null;
  simulatedResult?: Record<string, any> | string | null;
  outcome: 'SUCCESS' | 'BLOCKED' | 'FAILED';
}

export interface ValidationReason {
  code: string;
  field?: string;
  message: string;
}

export interface RecordValidationResult {
  rowIndex: number;
  recordRef: string;
  classification: ValidationClass;
  reasons: ValidationReason[];
  displayPreview: string;
  rawPayload?: Record<string, any>;
}

export interface FileValidationReport {
  fileName: string;
  fileSizeBytes: number;
  processedAt: string;
  fileStatus: 'PROCESSED' | 'FILE_REJECTED';
  fileError: string | null;
  failingStage?: number | null;
  totals: {
    total: number;
    accepted: number;
    warning: number;
    duplicate: number;
    rejected: number;
    quarantined: number;
  };
  records: RecordValidationResult[];
}

export interface ScenarioInputs {
  baselineDemandKw: number;
  multiplier: number;
  capacityPercent: number;
  emergencyDurationHours: number;
}

export interface AllocatedLoadItem extends LoadRecord {
  scaledRequestedKw: number;
  effectiveMinKw: number;
  allocatedKw: number;
  reducedKw: number;
  deferredKw: number;
  unmetKw: number;
  status: 'FULL' | 'REDUCED' | 'AT_MINIMUM' | 'DEFERRED' | 'UNSERVED_WARNING' | 'NOT_ALLOCATED';
  explanation?: string;
  isManuallyOverridden?: boolean;
}

export interface AllocationPlanResult {
  feasible: boolean;
  hasManualOverrides?: boolean;
  baselineDemandKw: number;
  multiplier: number;
  currentDemandKw: number;
  originalCapacityKw: number;
  capacityPercent: number;
  availableKw: number;
  deficitKw: number;
  supplyRatio: number;
  severity: SeverityLevel;
  mandatoryTotalKw: number;
  shortfallKw: number;
  allocatedTotalKw: number;
  unmetTotalKw: number;
  utilisationRatio: number;
  loads: AllocatedLoadItem[];
  conflictBreakdown?: {
    p0Full: number;
    p1Min: number;
    p2Min: number;
    p3NonDeferrableMin: number;
    subtotal: number;
    capacity: number;
    shortfall: number;
    minFeasiblePercent: number;
  };
  categoryTotals: {
    P0: { requested: number; allocated: number; unmet: number };
    P1: { requested: number; allocated: number; unmet: number };
    P2: { requested: number; allocated: number; unmet: number };
    P3: { requested: number; allocated: number; unmet: number };
  };
}

export interface BookingRequest {
  id: string;
  requester: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'REALLOCATED';
  adminNotes?: string;
}

export interface MaintenanceItem {
  id: string;
  roomId: string;
  equipment: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTo: string;
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  reportedAt: string;
  resolvedAt?: string;
  notes?: string;
}
