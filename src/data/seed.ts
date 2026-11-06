import { RoomRecord, EquipmentRecord, LoadRecord } from '../types/index.ts';

/**
 * Returns fresh seed rooms with timestamps generated at now - 2 minutes
 * per MASTER.md §17.1 so readings start fresh.
 */
export function getInitialSeedRooms(nowIso?: string): RoomRecord[] {
  const baseTime = nowIso ? new Date(nowIso) : new Date();
  const freshTime = new Date(baseTime.getTime() - 2 * 60 * 1000).toISOString();

  return [
    {
      roomId: 'A-101',
      buildingId: 'A',
      roomName: 'Classroom A-101',
      roomType: 'Classroom',
      roomCapacity: 60,
      occupancy: 32,
      occupancyState: 'OCCUPIED',
      unknownReason: null,
      powerKw: 4.2,
      baselinePowerKw: 4.0,
      previousPowerKw: 4.1,
      maxPowerKw: 15.0,
      meterType: 'UNIDIRECTIONAL',
      meterStatus: 'HEALTHY',
      sensorStatus: 'HEALTHY',
      equipmentList: [],
      scheduledStatus: 'IN_SESSION',
      scheduleConflict: 'NONE',
      usageFlag: 'NORMAL',
      dataQuality: 'HEALTHY',
      maintenance: { active: false },
      simulatedPowerState: 'NORMAL',
      timestamp: freshTime,
    },
    {
      roomId: 'A-102',
      buildingId: 'A',
      roomName: 'Classroom A-102',
      roomType: 'Classroom',
      roomCapacity: 60,
      occupancy: 0,
      occupancyState: 'VERIFIED_EMPTY',
      unknownReason: null,
      powerKw: 3.1,
      baselinePowerKw: 0.6,
      previousPowerKw: 3.0,
      maxPowerKw: 15.0,
      meterType: 'UNIDIRECTIONAL',
      meterStatus: 'HEALTHY',
      sensorStatus: 'HEALTHY',
      equipmentList: [],
      scheduledStatus: 'NO_SESSION',
      scheduleConflict: 'NONE',
      usageFlag: 'EMPTY_BUT_CONSUMING',
      dataQuality: 'HEALTHY',
      maintenance: { active: false },
      simulatedPowerState: 'NORMAL',
      timestamp: freshTime,
    },
    {
      roomId: 'B-203',
      buildingId: 'B',
      roomName: 'Computer Lab B-203',
      roomType: 'Computer lab',
      roomCapacity: 40,
      occupancy: 'UNKNOWN',
      occupancyState: 'UNKNOWN',
      unknownReason: 'SENSOR_OFFLINE',
      powerKw: 2.8,
      baselinePowerKw: 2.5,
      previousPowerKw: 2.6,
      maxPowerKw: 12.0,
      meterType: 'UNIDIRECTIONAL',
      meterStatus: 'HEALTHY',
      sensorStatus: 'OFFLINE',
      equipmentList: [],
      scheduledStatus: 'IN_SESSION',
      scheduleConflict: 'NONE',
      usageFlag: 'NORMAL',
      dataQuality: 'HEALTHY',
      maintenance: { active: false },
      simulatedPowerState: 'NORMAL',
      timestamp: freshTime,
    },
    {
      roomId: 'L-301',
      buildingId: 'L',
      roomName: 'Laboratory L-301',
      roomType: 'Laboratory',
      roomCapacity: 20,
      occupancy: 12,
      occupancyState: 'OCCUPIED',
      unknownReason: null,
      powerKw: 8.5,
      baselinePowerKw: 5.0,
      previousPowerKw: 5.2,
      maxPowerKw: 20.0,
      meterType: 'UNIDIRECTIONAL',
      meterStatus: 'HEALTHY',
      sensorStatus: 'HEALTHY',
      equipmentList: [],
      scheduledStatus: 'IN_SESSION',
      scheduleConflict: 'NONE',
      usageFlag: 'HIGH_USAGE',
      dataQuality: 'HEALTHY',
      maintenance: { active: false },
      simulatedPowerState: 'NORMAL',
      timestamp: freshTime,
    },
    {
      roomId: 'C-105',
      buildingId: 'C',
      roomName: 'Classroom C-105',
      roomType: 'Classroom',
      roomCapacity: 30,
      occupancy: 0,
      occupancyState: 'VERIFIED_EMPTY',
      unknownReason: null,
      powerKw: 2.6,
      baselinePowerKw: 1.8,
      previousPowerKw: 1.8,
      maxPowerKw: 10.0,
      meterType: 'UNIDIRECTIONAL',
      meterStatus: 'HEALTHY',
      sensorStatus: 'HEALTHY',
      equipmentList: [],
      scheduledStatus: 'IN_SESSION',
      scheduleConflict: 'SESSION_BUT_EMPTY',
      usageFlag: 'EMPTY_BUT_CONSUMING',
      dataQuality: 'HEALTHY',
      maintenance: { active: false },
      simulatedPowerState: 'NORMAL',
      timestamp: freshTime,
    },
    {
      roomId: 'D-002',
      buildingId: 'D',
      roomName: 'Main Library Reading Hall',
      roomType: 'Library',
      roomCapacity: 80,
      occupancy: 41,
      occupancyState: 'OCCUPIED',
      unknownReason: null,
      powerKw: 6.1,
      baselinePowerKw: 6.0,
      previousPowerKw: 6.0,
      maxPowerKw: 15.0,
      meterType: 'UNIDIRECTIONAL',
      meterStatus: 'HEALTHY',
      sensorStatus: 'HEALTHY',
      equipmentList: [],
      scheduledStatus: 'IN_SESSION',
      scheduleConflict: 'NONE',
      usageFlag: 'NORMAL',
      dataQuality: 'HEALTHY',
      maintenance: { active: false },
      simulatedPowerState: 'NORMAL',
      timestamp: freshTime,
    },
    {
      roomId: 'B-001',
      buildingId: 'B',
      roomName: 'Central Server Room',
      roomType: 'Server room',
      roomCapacity: 4,
      occupancy: 0,
      occupancyState: 'VERIFIED_EMPTY',
      unknownReason: null,
      powerKw: 4.0,
      baselinePowerKw: 4.0,
      previousPowerKw: 4.0,
      maxPowerKw: 10.0,
      meterType: 'UNIDIRECTIONAL',
      meterStatus: 'HEALTHY',
      sensorStatus: 'HEALTHY',
      equipmentList: ['EQ-001'],
      scheduledStatus: 'NO_SESSION',
      scheduleConflict: 'NONE',
      usageFlag: 'NORMAL',
      dataQuality: 'HEALTHY',
      maintenance: { active: false },
      simulatedPowerState: 'NORMAL',
      timestamp: freshTime,
    },
  ];
}

/**
 * Seed equipment registry per MASTER.md §17.2
 */
export function getInitialSeedEquipment(): EquipmentRecord[] {
  return [
    {
      equipmentId: 'EQ-001',
      name: 'Server rack R1',
      buildingId: 'B',
      roomId: 'B-001',
      category: 'SERVER',
      protected: true,
      active: true,
      minimumOperatingKw: 3.5,
      reasonForProtection: 'Institution-designated essential server',
    },
  ];
}

/**
 * Reference load dataset per MASTER.md §9.4
 * Defined at reference scenario (100 kW × 3 = 300 kW).
 */
export function getInitialSeedLoads(): LoadRecord[] {
  return [
    {
      loadId: 'L-01',
      buildingId: 'Campus-wide',
      roomId: 'Campus-wide',
      loadName: 'Emergency systems & Fire alarms',
      priority: 'P0',
      requestedKw: 8.0,
      minimumKw: 8.0,
      protected: true,
      deferrable: false,
      reductionConstraints: 'Absolute safety priority; never reduce',
      operationalNotes: 'Mandatory campus safety infrastructure',
      sortOrder: 1,
      simulatedAllocatedKw: 8.0,
    },
    {
      loadId: 'L-02',
      buildingId: 'B',
      roomId: 'B-001',
      loadName: 'Campus Core Network & Gateway',
      priority: 'P0',
      requestedKw: 4.0,
      minimumKw: 4.0,
      protected: true,
      deferrable: false,
      reductionConstraints: 'Critical institutional connectivity',
      operationalNotes: 'Main router racks and fiber switches',
      sortOrder: 2,
      simulatedAllocatedKw: 4.0,
    },
    {
      loadId: 'L-03',
      buildingId: 'B',
      roomId: 'B-110',
      loadName: 'Research Cryogenic & Chemical Freezers',
      priority: 'P1',
      requestedKw: 15.0,
      minimumKw: 10.0,
      protected: false,
      deferrable: false,
      reductionConstraints: 'Preserve minimum 10 kW thermal safety envelope',
      operationalNotes: 'Thermal inertia allows 2-hour throttling to 10 kW',
      sortOrder: 3,
      simulatedAllocatedKw: 15.0,
    },
    {
      loadId: 'L-04',
      buildingId: 'Campus-wide',
      roomId: 'Campus-wide',
      loadName: 'Health Centre & Essential Water Pumps',
      priority: 'P1',
      requestedKw: 10.0,
      minimumKw: 6.0,
      protected: false,
      deferrable: false,
      reductionConstraints: 'Maintain minimum hydro-pressure and clinic power',
      operationalNotes: 'Potable water pumps and clinic baseline',
      sortOrder: 4,
      simulatedAllocatedKw: 10.0,
    },
    {
      loadId: 'L-05',
      buildingId: 'A',
      roomId: 'Multiple (A-Block)',
      loadName: 'In-Session Lecture Halls & Lights',
      priority: 'P2',
      requestedKw: 25.0,
      minimumKw: 8.0,
      protected: false,
      deferrable: false,
      reductionConstraints: 'Allow reduced illumination, avoid blackouts during class',
      operationalNotes: 'Active academic rooms with scheduled instruction',
      sortOrder: 5,
      simulatedAllocatedKw: 8.0,
    },
    {
      loadId: 'L-06',
      buildingId: 'D',
      roomId: 'D-002',
      loadName: 'Central Library Air Circulation & Study Hall',
      priority: 'P2',
      requestedKw: 25.0,
      minimumKw: 6.0,
      protected: false,
      deferrable: false,
      reductionConstraints: 'Maintain air exchange ventilation baseline',
      operationalNotes: 'Library occupancy fluctuates; cooling can trim to fan-only',
      sortOrder: 6,
      simulatedAllocatedKw: 6.0,
    },
    {
      loadId: 'L-07',
      buildingId: 'Campus-wide',
      roomId: 'Campus-wide',
      loadName: 'Unoccupied Classrooms HVAC & Climate Zones',
      priority: 'P3',
      requestedKw: 80.0,
      minimumKw: 0.0,
      protected: false,
      deferrable: true,
      reductionConstraints: 'Fully deferrable when rooms are empty',
      operationalNotes: 'Chilled water coils and rooftop units for idle wings',
      sortOrder: 7,
      simulatedAllocatedKw: 0.0,
    },
    {
      loadId: 'L-08',
      buildingId: 'Campus-wide',
      roomId: 'Campus-wide',
      loadName: 'Architectural & Peripheral Walkway Lighting',
      priority: 'P3',
      requestedKw: 50.0,
      minimumKw: 0.0,
      protected: false,
      deferrable: true,
      reductionConstraints: 'Safe to defer during daylight or emergency curfew',
      operationalNotes: 'Façade spots, lawn floodlights, decorative accents',
      sortOrder: 8,
      simulatedAllocatedKw: 0.0,
    },
    {
      loadId: 'L-09',
      buildingId: 'Campus-wide',
      roomId: 'Campus-wide',
      loadName: 'Non-Essential Workshops & Idle Compute Clusters',
      priority: 'P3',
      requestedKw: 83.0,
      minimumKw: 0.0,
      protected: false,
      deferrable: true,
      reductionConstraints: 'Can pause batch jobs without data corruption',
      operationalNotes: 'Student maker-space CNCs, batch ML training rigs',
      sortOrder: 9,
      simulatedAllocatedKw: 0.0,
    },
  ];
}

/**
 * Generates fresh sample datasets (CSV and JSON) with fresh timestamps
 * so downloads always pass the 60-minute freshness rule!
 */
export function generateSampleValidCsv(nowIso?: string): string {
  const ts = nowIso || new Date().toISOString();
  return [
    'readingId,sourceId,roomId,timestamp,powerKw,occupancy,meterType,sensorStatus,note',
    `READ-101,SRC-IOT-01,A-101,${ts},4.2,32,UNIDIRECTIONAL,HEALTHY,Midterm session`,
    `READ-102,SRC-IOT-01,A-102,${ts},3.1,0,UNIDIRECTIONAL,HEALTHY,Empty hall`,
    `READ-103,SRC-IOT-02,B-203,${ts},2.8,UNKNOWN,UNIDIRECTIONAL,OFFLINE,Sensor maintenance required`,
    `READ-104,SRC-IOT-03,L-301,${ts},8.5,12,UNIDIRECTIONAL,HEALTHY,Robotics testing`,
    `READ-105,SRC-IOT-01,C-105,${ts},2.6,0,UNIDIRECTIONAL,HEALTHY,Scheduled seminar delay`,
    `READ-106,SRC-IOT-04,D-002,${ts},6.1,41,UNIDIRECTIONAL,HEALTHY,Quiet study zone`,
    `READ-107,SRC-IOT-02,B-001,${ts},4.0,0,UNIDIRECTIONAL,HEALTHY,Server baseline`,
  ].join('\n');
}

export function generateSampleValidJson(nowIso?: string): string {
  const ts = nowIso || new Date().toISOString();
  const records = [
    { readingId: 'READ-101', sourceId: 'SRC-IOT-01', roomId: 'A-101', timestamp: ts, powerKw: 4.2, occupancy: 32, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Midterm session' },
    { readingId: 'READ-102', sourceId: 'SRC-IOT-01', roomId: 'A-102', timestamp: ts, powerKw: 3.1, occupancy: 0, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Empty hall' },
    { readingId: 'READ-103', sourceId: 'SRC-IOT-02', roomId: 'B-203', timestamp: ts, powerKw: 2.8, occupancy: 'UNKNOWN', meterType: 'UNIDIRECTIONAL', sensorStatus: 'OFFLINE', note: 'Sensor maintenance required' },
    { readingId: 'READ-104', sourceId: 'SRC-IOT-03', roomId: 'L-301', timestamp: ts, powerKw: 8.5, occupancy: 12, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Robotics testing' },
    { readingId: 'READ-105', sourceId: 'SRC-IOT-01', roomId: 'C-105', timestamp: ts, powerKw: 2.6, occupancy: 0, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Scheduled seminar delay' },
    { readingId: 'READ-106', sourceId: 'SRC-IOT-04', roomId: 'D-002', timestamp: ts, powerKw: 6.1, occupancy: 41, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Quiet study zone' },
    { readingId: 'READ-107', sourceId: 'SRC-IOT-02', roomId: 'B-001', timestamp: ts, powerKw: 4.0, occupancy: 0, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Server baseline' },
  ];
  return JSON.stringify(records, null, 2);
}

/**
 * Combined Bad Data Demo (MASTER.md §17.5)
 * Contains 9 readings:
 * A-101: all valid -> ACCEPTED
 * A-102: occupancy -4 -> REJECTED
 * A-103: occupancy empty -> WARNING (UNKNOWN)
 * A-104 (1): valid, source SRC-1, timestamp T -> ACCEPTED
 * A-104 (2): identical repeat (same source & timestamp T) -> DUPLICATE
 * A-105: timestamp 2026-13-45T25:61:00Z -> QUARANTINED
 * A-107: powerKw = "high" -> REJECTED
 * A-108: powerKw = 250 (max 15) -> QUARANTINED
 * A-109: note = <script>alert(1)</script> -> QUARANTINED, shown as inert text
 * Expected totals: 9 total · 2 accepted · 1 warning · 1 duplicate · 2 rejected · 3 quarantined
 */
export function generateCombinedBadDemoCsv(nowIso?: string): string {
  const ts = nowIso || new Date().toISOString();
  return [
    'readingId,sourceId,roomId,timestamp,powerKw,occupancy,meterType,sensorStatus,note',
    `A-101,SRC-01,A-101,${ts},4.2,32,UNIDIRECTIONAL,HEALTHY,Valid reference record`,
    `A-102,SRC-01,A-102,${ts},3.1,-4,UNIDIRECTIONAL,HEALTHY,Negative occupancy test`,
    `A-103,SRC-02,D-002,${ts},6.1,,UNIDIRECTIONAL,HEALTHY,Missing occupancy test`,
    `A-104,SRC-1,L-301,${ts},8.5,12,UNIDIRECTIONAL,HEALTHY,Primary occurrence`,
    `A-104,SRC-1,L-301,${ts},8.5,12,UNIDIRECTIONAL,HEALTHY,Identical duplicate timestamp`,
    `A-105,SRC-03,C-105,2026-13-45T25:61:00Z,2.6,0,UNIDIRECTIONAL,HEALTHY,Malformed timestamp`,
    `A-107,SRC-04,B-203,${ts},high,UNKNOWN,UNIDIRECTIONAL,OFFLINE,Invalid non-numeric power`,
    `A-108,SRC-01,A-101,${ts},250.0,30,UNIDIRECTIONAL,HEALTHY,Unrealistic power exceeding circuit rating`,
    `A-109,SRC-02,D-002,${ts},6.1,40,UNIDIRECTIONAL,HEALTHY,<script>alert(1)</script>`,
  ].join('\n');
}

export function generateCombinedBadDemoJson(nowIso?: string): string {
  const ts = nowIso || new Date().toISOString();
  const records = [
    { readingId: 'A-101', sourceId: 'SRC-01', roomId: 'A-101', timestamp: ts, powerKw: 4.2, occupancy: 32, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Valid reference record' },
    { readingId: 'A-102', sourceId: 'SRC-01', roomId: 'A-102', timestamp: ts, powerKw: 3.1, occupancy: -4, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Negative occupancy test' },
    { readingId: 'A-103', sourceId: 'SRC-02', roomId: 'D-002', timestamp: ts, powerKw: 6.1, occupancy: '', meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Missing occupancy test' },
    { readingId: 'A-104', sourceId: 'SRC-1', roomId: 'L-301', timestamp: ts, powerKw: 8.5, occupancy: 12, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Primary occurrence' },
    { readingId: 'A-104', sourceId: 'SRC-1', roomId: 'L-301', timestamp: ts, powerKw: 8.5, occupancy: 12, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Identical duplicate timestamp' },
    { readingId: 'A-105', sourceId: 'SRC-03', roomId: 'C-105', timestamp: '2026-13-45T25:61:00Z', powerKw: 2.6, occupancy: 0, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Malformed timestamp' },
    { readingId: 'A-107', sourceId: 'SRC-04', roomId: 'B-203', timestamp: ts, powerKw: 'high', occupancy: 'UNKNOWN', meterType: 'UNIDIRECTIONAL', sensorStatus: 'OFFLINE', note: 'Invalid non-numeric power' },
    { readingId: 'A-108', sourceId: 'SRC-01', roomId: 'A-101', timestamp: ts, powerKw: 250.0, occupancy: 30, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: 'Unrealistic power exceeding circuit rating' },
    { readingId: 'A-109', sourceId: 'SRC-02', roomId: 'D-002', timestamp: ts, powerKw: 6.1, occupancy: 40, meterType: 'UNIDIRECTIONAL', sensorStatus: 'HEALTHY', note: '<script>alert(1)</script>' },
  ];
  return JSON.stringify(records, null, 2);
}
