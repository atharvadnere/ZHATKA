import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  AllocatedLoadItem,
  AllocationPlanResult,
  AuditRecord,
  BookingRequest,
  EquipmentRecord,
  FileValidationReport,
  LoadRecord,
  EmergencyScenarioPreset,
  MaintenanceItem,
  RecommendationRecord,
  RoomRecord,
  ScenarioInputs,
} from '../types/index.ts';
import {
  getInitialSeedEquipment,
  getInitialSeedLoads,
  getInitialSeedRooms,
} from '../data/seed.ts';
import { CONFIG } from '../config/defaults.ts';
import { calculateCampusKpis, CampusKpis } from '../logic/monitor/kpis.ts';
import { allocateLoads } from '../logic/planner/allocate.ts';
import { generateRecommendations } from '../logic/recommendations/generate.ts';
import { evaluateSafety } from '../logic/safety/evaluateSafety.ts';
import { createAuditEvent } from '../logic/audit/auditLog.ts';
import { calculateMeasuredSavings } from '../logic/verification/savings.ts';
import { resolveOccupancy } from '../logic/monitor/resolveOccupancy.ts';
import { evaluateUsageFlag } from '../logic/monitor/usageFlags.ts';

export type AppPage =
  | 'landing'
  | 'login'
  | 'overview'
  | 'buildings'
  | 'rooms'
  | 'bookings'
  | 'monitoring'
  | 'planner'
  | 'data-integrity'
  | 'analytics'
  | 'intelligence'
  | 'notifications'
  | 'maintenance'
  | 'audit'
  | 'settings'
  | 'profile';

export interface UserProfile {
  email: string;
  name: string;
  role: string;
  campus: string;
}

export interface AppState {
  theme: 'light' | 'dark';
  currentUser: UserProfile | null;
  activePage: AppPage;
  rooms: RoomRecord[];
  equipment: EquipmentRecord[];
  loads: LoadRecord[];
  scenarioInputs: ScenarioInputs;
  allocationPlan: AllocationPlanResult;
  manualLoadOverrides: Record<string, number>;
  recommendations: RecommendationRecord[];
  auditEvents: AuditRecord[];
  bookingRequests: BookingRequest[];
  maintenanceItems: MaintenanceItem[];
  latestValidationReport: FileValidationReport | null;
  activeScenarioId: string | null;
  selectedRoomId: string | null;
  toast: { message: string; type?: 'info' | 'success' | 'warning' | 'critical' } | null;
  kpis: CampusKpis;
  planApproved: boolean;
  alertPopupOpen: boolean;
  customScenarios: EmergencyScenarioPreset[];

  // Actions
  toggleTheme: () => void;
  setAlertPopupOpen: (open: boolean) => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  setActivePage: (page: AppPage) => void;
  setSelectedRoomId: (id: string | null) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'critical') => void;
  updateScenarioInputs: (inputs: Partial<ScenarioInputs>) => void;
  runAllocation: () => void;
  approvePlan: (comment?: string) => void;
  rejectPlan: (comment?: string) => void;
  updateLoadAllocation: (loadId: string, kw: number) => void;
  resetLoadOverrides: () => void;
  approveRecommendation: (id: string, comment?: string) => void;
  rejectRecommendation: (id: string, comment?: string) => void;
  markFalseAlarm: (id: string, comment?: string) => void;
  remediateQuarantinedRecord: (
    rowIndex: number,
    updatedPayload: {
      readingId: string;
      roomId: string;
      timestamp: string;
      powerKw: number;
      occupancy: number | null;
      note?: string;
    }
  ) => void;
  applyRecommendation: (id: string) => { success: boolean; message: string };
  verifySavings: (id: string) => void;
  toggleEquipmentProtection: (id: string) => void;
  addEquipment: (item: Omit<EquipmentRecord, 'equipmentId'>) => void;
  toggleRoomMaintenance: (roomId: string, active: boolean, until?: string | null) => void;
  applyValidationResults: (report: FileValidationReport) => void;
  addBookingRequest: (req: Omit<BookingRequest, 'id'>) => void;
  updateBookingStatus: (id: string, status: BookingRequest['status'], adminNotes?: string) => void;
  addMaintenanceItem: (item: Omit<MaintenanceItem, 'id' | 'reportedAt'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceItem['status']) => void;
  loadScenario: (scenarioNum: number) => void;
  saveCustomScenario: (preset: EmergencyScenarioPreset) => void;
  updateCustomScenario: (id: string, updates: Partial<EmergencyScenarioPreset>) => void;
  deleteCustomScenario: (id: string) => void;
  resetDemo: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'zhatka.v1.state';

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    email: 'admin@srmist.edu.in',
    name: 'Campus Energy Administrator',
    role: 'Administrator (simulated)',
    campus: 'SRMIST Main Campus (Simulated)',
  });

  const [activePage, setActivePage] = useState<AppPage>('overview');
  const [rooms, setRooms] = useState<RoomRecord[]>(() => getInitialSeedRooms());
  const [equipment, setEquipment] = useState<EquipmentRecord[]>(() => getInitialSeedEquipment());
  const [loads, setLoads] = useState<LoadRecord[]>(() => getInitialSeedLoads());

  const [scenarioInputs, setScenarioInputs] = useState<ScenarioInputs>({
    baselineDemandKw: CONFIG.defaultBaselineDemandKw,
    multiplier: CONFIG.defaultDemandMultiplier,
    capacityPercent: CONFIG.defaultCapacityPercent,
    emergencyDurationHours: CONFIG.emergencyDurationHours,
  });

  const [planApproved, setPlanApproved] = useState<boolean>(false);
  const [latestValidationReport, setLatestValidationReport] = useState<FileValidationReport | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>('scenario-1');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' | 'critical' } | null>(null);

  // Theme state with local persistence & html class toggle
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('zhatka_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('zhatka_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Alert popup state
  const [alertPopupOpen, setAlertPopupOpen] = useState(false);

  // Manual Load Overrides (Emergency Planner editable allocation)
  const [manualLoadOverrides, setManualLoadOverrides] = useState<Record<string, number>>({});

  const updateLoadAllocation = (loadId: string, kw: number) => {
    setManualLoadOverrides((prev) => ({
      ...prev,
      [loadId]: Math.max(0, Math.round(kw * 10) / 10),
    }));
    setPlanApproved(false);
  };

  const resetLoadOverrides = () => {
    setManualLoadOverrides({});
    setPlanApproved(false);
    showToast('Reset all manual load allocations to algorithmic baseline.', 'info');
  };

  // Custom Emergency Scenarios
  const [customScenarios, setCustomScenarios] = useState<EmergencyScenarioPreset[]>([
    {
      id: 'custom-grid-loss',
      name: '33kV Substation Transformer Failure',
      description: 'Sudden loss of grid feed 2. Campus operates on emergency DG sets at 45% available capacity.',
      baselineDemandKw: 100,
      multiplier: 2.8,
      capacityPercent: 45,
      emergencyDurationHours: 4,
      isCustom: true,
    },
    {
      id: 'custom-heatwave',
      name: 'Severe Heatwave Chiller Demand Surge',
      description: 'Chiller and HVAC cooling demand surges across all blocks with 3.2x multiplier under 60% grid limit.',
      baselineDemandKw: 120,
      multiplier: 3.2,
      capacityPercent: 60,
      emergencyDurationHours: 3,
      isCustom: true,
    },
    {
      id: 'custom-solar-dip',
      name: 'Monsoon Rooftop Solar Drop',
      description: 'Cloud cover causes immediate 70 kW solar generation drop during high laboratory session.',
      baselineDemandKw: 95,
      multiplier: 2.4,
      capacityPercent: 50,
      emergencyDurationHours: 2,
      isCustom: true,
    },
  ]);

  const saveCustomScenario = (preset: EmergencyScenarioPreset) => {
    setCustomScenarios((prev) => {
      const existing = prev.findIndex((s) => s.id === preset.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = preset;
        return copy;
      }
      return [...prev, preset];
    });
    showToast(`Emergency scenario "${preset.name}" saved.`, 'success');
  };

  const updateCustomScenario = (id: string, updates: Partial<EmergencyScenarioPreset>) => {
    setCustomScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Scenario parameters updated.', 'info');
  };

  const deleteCustomScenario = (id: string) => {
    setCustomScenarios((prev) => prev.filter((s) => s.id !== id));
    showToast('Custom scenario removed.', 'info');
  };

  // Initial bookings
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: 'BK-001',
      requester: 'Prof. Ramesh (Dept of Robotics)',
      roomId: 'L-301',
      roomName: 'Laboratory L-301',
      date: '2026-11-06',
      startTime: '14:00',
      endTime: '17:00',
      purpose: 'Autonomous drone sensor calibration lab',
      attendees: 18,
      status: 'APPROVED',
      adminNotes: 'Approved. Essential research allocation.',
    },
    {
      id: 'BK-002',
      requester: 'Dr. Ananya (Student Affairs)',
      roomId: 'A-102',
      roomName: 'Classroom A-102',
      date: '2026-11-06',
      startTime: '10:00',
      endTime: '12:00',
      purpose: 'IEEE Student Chapter Council Meeting',
      attendees: 45,
      status: 'PENDING',
    },
    {
      id: 'BK-003',
      requester: 'Kavita Menon (Cultural Secretary)',
      roomId: 'D-002',
      roomName: 'Main Library Reading Hall',
      date: '2026-11-07',
      startTime: '18:00',
      endTime: '21:00',
      purpose: 'Acoustic evening rehearsal',
      attendees: 30,
      status: 'REJECTED',
      adminNotes: 'Library quiet zone policy restricts amplified events.',
    },
  ]);

  // Initial maintenance
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([
    {
      id: 'MNT-001',
      roomId: 'B-203',
      equipment: 'PIR Passive Infrared Sensor #03',
      issue: 'Sensor offline. Dropped communication 4 hours ago.',
      priority: 'HIGH',
      assignedTo: 'Instrumentation Team (R. Kumar)',
      status: 'IN_PROGRESS',
      reportedAt: '2026-11-05T18:00:00Z',
      notes: 'Replacement gateway transceiver dispatched.',
    },
    {
      id: 'MNT-002',
      roomId: 'L-301',
      equipment: 'Fume Hood Exhaust Inverter VFD',
      issue: 'Power draw elevated by 70% over expected idle baseline.',
      priority: 'MEDIUM',
      assignedTo: 'Electrical Maintenance (S. Nair)',
      status: 'REPORTED',
      reportedAt: '2026-11-05T20:30:00Z',
    },
  ]);

  // Initial audit events
  const [auditEvents, setAuditEvents] = useState<AuditRecord[]>(() => [
    createAuditEvent({
      action: 'SYSTEM_BOOT',
      target: 'CAMPUS_CONTROLLER',
      reason: 'ZHATKA Adaptive Campus Energy Planner initialized in simulated demonstration mode.',
      counter: 1,
    }),
    createAuditEvent({
      action: 'SCENARIO_LOADED',
      target: 'SCENARIO-1',
      reason: 'Normal campus baseline profile active (31.3 kW demand, 100 kW capacity).',
      counter: 2,
    }),
  ]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'critical' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Compute allocation plan with manual load override support
  const allocationPlan = useMemo(() => {
    const basePlan = allocateLoads(loads, scenarioInputs);
    const overrideKeys = Object.keys(manualLoadOverrides);
    if (overrideKeys.length === 0) {
      return basePlan;
    }

    let totalAllocated = 0;
    const overriddenLoads = basePlan.loads.map((l) => {
      if (manualLoadOverrides[l.loadId] !== undefined) {
        const manualKw = manualLoadOverrides[l.loadId];
        totalAllocated += manualKw;
        const reduced = Math.max(0, l.scaledRequestedKw - manualKw);
        return {
          ...l,
          allocatedKw: manualKw,
          reducedKw: Math.round(reduced * 10) / 10,
          unmetKw: Math.max(0, Math.round((l.scaledRequestedKw - manualKw) * 10) / 10),
          status: (manualKw === 0 
            ? 'DEFERRED' 
            : manualKw < l.effectiveMinKw 
            ? 'UNSERVED_WARNING' 
            : manualKw < l.scaledRequestedKw 
            ? 'REDUCED' 
            : 'FULL') as AllocatedLoadItem['status'],
          isManuallyOverridden: true,
          explanation: `Manually overridden by administrator to ${manualKw.toFixed(1)} kW.`,
        };
      }
      totalAllocated += l.allocatedKw;
      return l;
    });

    const roundedTotal = Math.round(totalAllocated * 10) / 10;
    const feasible = roundedTotal <= basePlan.availableKw;

    return {
      ...basePlan,
      allocatedTotalKw: roundedTotal,
      loads: overriddenLoads,
      feasible,
      hasManualOverrides: true,
      feasibilityReason: feasible
        ? `Manual overrides active: ${roundedTotal} kW allocated vs ${basePlan.availableKw} kW capacity limit.`
        : `Manual override allocation of ${roundedTotal} kW exceeds maximum emergency capacity of ${basePlan.availableKw} kW.`,
    };
  }, [loads, scenarioInputs, manualLoadOverrides]);

  // Generate recommendations
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);

  useEffect(() => {
    setRecommendations((prev) =>
      generateRecommendations({
        rooms,
        equipment,
        loads: allocationPlan.loads,
        existingRecommendations: prev,
      })
    );
  }, [rooms, equipment, allocationPlan.loads]);

  // Compute campus KPIs
  const kpis = useMemo(() => {
    return calculateCampusKpis(rooms, equipment, scenarioInputs.baselineDemandKw);
  }, [rooms, equipment, scenarioInputs.baselineDemandKw]);

  // Auth actions
  const login = (email: string, pass: string): boolean => {
    // Demo validation per DESIGN.md §6.1
    if (email === 'admin@srmist.edu.in' && pass === 'zhatka2026') {
      setCurrentUser({
        email: 'admin@srmist.edu.in',
        name: 'Campus Energy Administrator',
        role: 'Administrator (simulated)',
        campus: 'SRMIST Main Campus (Simulated)',
      });
      setActivePage('overview');
      showToast('Logged in as Campus Energy Administrator (Demo Access)', 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setActivePage('landing');
    showToast('Logged out of demo session', 'info');
  };

  const updateScenarioInputs = (inputs: Partial<ScenarioInputs>) => {
    setScenarioInputs((prev) => ({ ...prev, ...inputs }));
    setPlanApproved(false); // Inputs change marks plan SUPERSEDED (§9.10)
  };

  const runAllocation = () => {
    setPlanApproved(false);
    const newEvent = createAuditEvent({
      action: 'ALLOCATION_RUN',
      target: `MULT-${scenarioInputs.multiplier}x_CAP-${scenarioInputs.capacityPercent}%`,
      reason: `Manual re-run of adaptive allocation algorithm for ${allocationPlan.currentDemandKw} kW demand vs ${allocationPlan.availableKw} kW capacity. Status: ${allocationPlan.feasible ? 'FEASIBLE' : 'INFEASIBLE'}.`,
      beforeReading: { availableKw: allocationPlan.availableKw, demandKw: allocationPlan.currentDemandKw },
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast(
      allocationPlan.feasible
        ? `Allocation calculated successfully (${allocationPlan.severity} severity)`
        : `Feasibility Check: NO FEASIBLE SAFE ALLOCATION`,
      allocationPlan.feasible ? 'success' : 'critical'
    );
  };

  const approvePlan = (comment?: string) => {
    if (!allocationPlan.feasible) return;
    setPlanApproved(true);

    // Mark plan reductions as COMPLETED simulated
    const updatedLoads = loads.map((l) => {
      const allocated = allocationPlan.loads.find((al) => al.loadId === l.loadId);
      return {
        ...l,
        simulatedAllocatedKw: allocated ? allocated.allocatedKw : l.requestedKw,
      };
    });
    setLoads(updatedLoads);

    const newEvent = createAuditEvent({
      action: 'ALLOCATION_APPROVED',
      target: 'PLAN_ALL_TIERS',
      reason: comment || 'Campus Energy Administrator approved emergency allocation schedule.',
      beforeReading: { totalRequestedKw: allocationPlan.currentDemandKw },
      afterReading: { totalAllocatedKw: allocationPlan.allocatedTotalKw },
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast('Emergency allocation plan approved and applied (simulated).', 'success');
  };

  const rejectPlan = (comment?: string) => {
    setPlanApproved(false);
    const newEvent = createAuditEvent({
      action: 'ALLOCATION_REJECTED',
      target: 'PLAN_ALL_TIERS',
      reason: comment || 'Plan rejected by administrator.',
      outcome: 'BLOCKED',
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast('Allocation plan rejected.', 'warning');
  };

  // Recommendations approval workflow
  const approveRecommendation = (id: string, comment?: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.recommendationId === id
          ? { ...r, approvalStatus: 'APPROVED', adminComment: comment }
          : r
      )
    );
    const rec = recommendations.find((r) => r.recommendationId === id);
    const newEvent = createAuditEvent({
      action: 'RECOMMENDATION_APPROVED',
      recommendationId: id,
      target: rec?.roomId || rec?.affectedLoadId || id,
      reason: comment || 'Administrator approved recommendation.',
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast('Recommendation approved.', 'success');
  };

  const rejectRecommendation = (id: string, comment?: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.recommendationId === id
          ? { ...r, approvalStatus: 'REJECTED', adminComment: comment }
          : r
      )
    );
    const rec = recommendations.find((r) => r.recommendationId === id);
    const newEvent = createAuditEvent({
      action: 'RECOMMENDATION_REJECTED',
      recommendationId: id,
      target: rec?.roomId || rec?.affectedLoadId || id,
      reason: comment || 'Administrator rejected recommendation.',
      outcome: 'BLOCKED',
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast('Recommendation rejected.', 'info');
  };

  const markFalseAlarm = (id: string, comment?: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.recommendationId === id
          ? {
              ...r,
              approvalStatus: 'FALSE_ALARM',
              adminComment: comment || 'Marked as False Alarm / Benign condition by administrator.',
            }
          : r
      )
    );
    const rec = recommendations.find((r) => r.recommendationId === id);
    const newEvent = createAuditEvent({
      action: 'FALSE_ALARM_DISMISSED',
      recommendationId: id,
      target: rec?.roomId || rec?.affectedLoadId || id,
      reason: comment || 'Administrator dismissed recommendation/alert as False Alarm.',
      outcome: 'SUCCESS',
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast('Alert dismissed as False Alarm.', 'info');
  };

  const remediateQuarantinedRecord = (
    rowIndex: number,
    updatedPayload: {
      readingId: string;
      roomId: string;
      timestamp: string;
      powerKw: number;
      occupancy: number | null;
      note?: string;
    }
  ) => {
    if (!latestValidationReport) {
      showToast('No active ingestion validation report to remediate.', 'warning');
      return;
    }

    const prevReport = latestValidationReport;
    const oldRec = prevReport.records[rowIndex];
    if (!oldRec) {
      showToast('Target quarantined record not found in active report.', 'critical');
      return;
    }

    // Update the record in the validation report
    const updatedRecords = [...prevReport.records];
    updatedRecords[rowIndex] = {
      ...oldRec,
      classification: 'ACCEPTED',
      displayPreview: `${updatedPayload.roomId} | Power: ${updatedPayload.powerKw.toFixed(1)} kW | Occ: ${
        updatedPayload.occupancy !== null ? updatedPayload.occupancy : 'UNKNOWN'
      } (Remediated by Admin)`,
      reasons: [
        {
          code: 'ADMIN_REMEDIATED',
          field: 'manual_override',
          message: updatedPayload.note || 'Sanitized and manually approved by campus administrator.',
        },
      ],
      rawPayload: {
        ...oldRec.rawPayload,
        readingId: updatedPayload.readingId,
        roomId: updatedPayload.roomId,
        timestamp: updatedPayload.timestamp,
        powerKw: updatedPayload.powerKw,
        occupancy: updatedPayload.occupancy,
      },
    };

    const newTotals = {
      ...prevReport.totals,
      quarantined: Math.max(0, prevReport.totals.quarantined - 1),
      accepted: prevReport.totals.accepted + 1,
    };

    setLatestValidationReport({
      ...prevReport,
      totals: newTotals,
      records: updatedRecords,
    });

    // Update room telemetry state with remediated reading
    setRooms((prevRooms) => {
      const roomIdx = prevRooms.findIndex((r) => r.roomId === updatedPayload.roomId);
      if (roomIdx < 0) return prevRooms;

      const current = prevRooms[roomIdx];
      const occRes = resolveOccupancy({
        sensorStatus: current.sensorStatus,
        occupancy: updatedPayload.occupancy,
        lastSeenTs: updatedPayload.timestamp,
        now: new Date(),
        scheduledStatus: current.scheduledStatus,
      });

      const usageFlag = evaluateUsageFlag({
        meterStatus: current.meterStatus === 'OFFLINE' ? 'HEALTHY' : current.meterStatus,
        occupancyState: occRes.state,
        powerKw: updatedPayload.powerKw,
        baselinePowerKw: current.baselinePowerKw,
      });

      const copy = [...prevRooms];
      copy[roomIdx] = {
        ...current,
        powerKw: updatedPayload.powerKw,
        occupancy: updatedPayload.occupancy,
        occupancyState: occRes.state,
        unknownReason: occRes.unknownReason,
        usageFlag,
        dataQuality: 'HEALTHY',
        timestamp: updatedPayload.timestamp,
      };
      return copy;
    });

    const auditEvt = createAuditEvent({
      action: 'QUARANTINE_REMEDIATED',
      target: updatedPayload.roomId,
      reason: `Quarantined record ${updatedPayload.readingId} remediated by admin: ${updatedPayload.powerKw} kW, occ: ${updatedPayload.occupancy ?? 'UNKNOWN'}. ${updatedPayload.note || ''}`,
      beforeReading: oldRec.rawPayload || { rowIndex },
      afterReading: updatedPayload,
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [auditEvt, ...prev]);

    showToast(`Quarantined record ${updatedPayload.readingId} successfully remediated and admitted into live campus state.`, 'success');
  };

  // Apply (Simulated) control action with action-time safety re-check (INV-10)
  const applyRecommendation = (id: string): { success: boolean; message: string } => {
    const rec = recommendations.find((r) => r.recommendationId === id);
    if (!rec) return { success: false, message: 'Recommendation not found.' };

    const room = rooms.find((r) => r.roomId === rec.roomId);
    if (!room) return { success: false, message: 'Target room not found.' };

    // Re-check safety at action time!
    const roomProtected = equipment.filter(
      (e) => e.roomId === room.roomId && e.active && e.protected
    );
    const recheckResult = evaluateSafety(
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
        protectedEquipment: roomProtected,
        maintenance: room.maintenance,
      },
      { type: rec.type }
    );

    if (!recheckResult.eligible) {
      const blockedEvent = createAuditEvent({
        action: 'CONTROL_BLOCKED',
        recommendationId: id,
        target: room.roomId,
        reason: `Apply blocked at action time: ${recheckResult.explanation}`,
        outcome: 'BLOCKED',
        counter: auditEvents.length + 1,
      });
      setAuditEvents((prev) => [blockedEvent, ...prev]);
      showToast(`Action blocked by Safety Engine: ${recheckResult.reasonCode}`, 'critical');
      return { success: false, message: recheckResult.explanation };
    }

    // Apply simulated action:
    // Simulated power becomes baseline + 0.3 residual kW (§11.2)
    const oldPower = room.powerKw;
    const newSimulatedPower = Math.round((room.baselinePowerKw + CONFIG.simulatedResidualKw) * 10) / 10;

    setRooms((prev) =>
      prev.map((r) =>
        r.roomId === room.roomId
          ? {
              ...r,
              powerKw: newSimulatedPower,
              usageFlag: 'NORMAL',
              simulatedPowerState: 'REDUCED',
            }
          : r
      )
    );

    setRecommendations((prev) =>
      prev.map((r) =>
        r.recommendationId === id
          ? { ...r, approvalStatus: 'COMPLETED' }
          : r
      )
    );

    const successEvent = createAuditEvent({
      action: 'ACTION_COMPLETED',
      recommendationId: id,
      target: room.roomId,
      reason: `Simulated shutdown action executed. Power reduced from ${oldPower} kW to ${newSimulatedPower} kW.`,
      beforeReading: { powerKw: oldPower },
      afterReading: { powerKw: newSimulatedPower },
      simulatedResult: { status: 'SIMULATED_REDUCED', residualKw: CONFIG.simulatedResidualKw },
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [successEvent, ...prev]);

    showToast(`Simulated action applied for ${room.roomId}. Power adjusted to ${newSimulatedPower} kW.`, 'success');
    return { success: true, message: 'Action applied successfully.' };
  };

  // Verify savings calculation
  const verifySavings = (id: string) => {
    const rec = recommendations.find((r) => r.recommendationId === id);
    if (!rec) return;

    const room = rooms.find((r) => r.roomId === rec.roomId);
    if (!room) return;

    const savingsResult = calculateMeasuredSavings({
      beforePowerKw: rec.currentPowerKw,
      afterPowerKw: room.powerKw,
      previousPowerKw: room.previousPowerKw,
      baselinePowerKw: room.baselinePowerKw,
    });

    setRecommendations((prev) =>
      prev.map((r) =>
        r.recommendationId === id
          ? { ...r, approvalStatus: 'VERIFIED' }
          : r
      )
    );

    const verifyEvent = createAuditEvent({
      action: 'ACTION_VERIFIED',
      recommendationId: id,
      target: room.roomId,
      reason: `Verification complete: ${savingsResult.formulaStr}`,
      beforeReading: { powerKw: savingsResult.beforePowerKw, energyKwh: savingsResult.baselineEnergyKwh },
      afterReading: { powerKw: savingsResult.afterPowerKw, energyKwh: savingsResult.postActionEnergyKwh },
      simulatedResult: {
        measuredSavingsKwh: savingsResult.measuredSavingsKwh,
        potentialKw: savingsResult.potentialKw,
        estimatedKwh: savingsResult.estimatedKwh,
      },
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [verifyEvent, ...prev]);

    showToast(`Savings verified: ${savingsResult.measuredSavingsKwh} kWh measured (simulated).`, 'success');
  };

  // Equipment & Shield actions
  const toggleEquipmentProtection = (id: string) => {
    const target = equipment.find((e) => e.equipmentId === id);
    if (!target) return;
    const oldVal = target.protected;
    const newVal = !oldVal;

    setEquipment((prev) =>
      prev.map((e) => (e.equipmentId === id ? { ...e, protected: newVal } : e))
    );

    const auditEvt = createAuditEvent({
      action: 'EQUIPMENT_CHANGED',
      target: id,
      reason: `Equipment '${target.name}' in room ${target.roomId} protection toggled ${oldVal} → ${newVal}.`,
      beforeReading: { protected: oldVal },
      afterReading: { protected: newVal },
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [auditEvt, ...prev]);
    showToast(`Equipment ${target.name} is now ${newVal ? 'PROTECTED' : 'UNPROTECTED'}`, 'info');
  };

  const addEquipment = (item: Omit<EquipmentRecord, 'equipmentId'>) => {
    const newId = `EQ-${String(equipment.length + 1).padStart(3, '0')}`;
    const newEquip: EquipmentRecord = { ...item, equipmentId: newId };
    setEquipment((prev) => [...prev, newEquip]);

    const auditEvt = createAuditEvent({
      action: 'EQUIPMENT_CHANGED',
      target: newId,
      reason: `New essential equipment registered: ${item.name} in room ${item.roomId}.`,
      afterReading: newEquip,
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [auditEvt, ...prev]);
    showToast(`Added equipment ${item.name} to ${item.roomId}`, 'success');
  };

  // Maintenance actions
  const toggleRoomMaintenance = (roomId: string, active: boolean, until?: string | null) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomId === roomId
          ? { ...r, maintenance: { active, until: active ? until || null : null } }
          : r
      )
    );

    const auditEvt = createAuditEvent({
      action: 'MAINTENANCE_CHANGED',
      target: roomId,
      reason: `Maintenance mode ${active ? 'ACTIVATED' : 'DEACTIVATED'} for room ${roomId}.`,
      afterReading: { active, until },
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [auditEvt, ...prev]);
    showToast(`Maintenance for ${roomId} ${active ? 'enabled (controls suppressed)' : 'cleared'}`, 'info');
  };

  // Apply validation report to room state (§8.9)
  const applyValidationResults = (report: FileValidationReport) => {
    setLatestValidationReport(report);

    // Apply accepted and warning records to room registry
    const updatedRooms = [...rooms];
    for (const rec of report.records) {
      const roomId = rec.rawPayload?.roomId || rec.recordRef;
      const roomIdx = updatedRooms.findIndex((r) => r.roomId === roomId);
      if (roomIdx !== -1) {
        const current = updatedRooms[roomIdx];
        if (rec.classification === 'ACCEPTED' || rec.classification === 'WARNING') {
          const powerKw = rec.rawPayload?.powerKw !== undefined ? Number(rec.rawPayload.powerKw) : current.powerKw;
          const occupancy = rec.rawPayload?.occupancy !== undefined && rec.rawPayload.occupancy !== '' ? rec.rawPayload.occupancy : current.occupancy;
          const sensorStatus = rec.rawPayload?.sensorStatus || current.sensorStatus;
          const meterStatus = rec.rawPayload?.meterStatus || current.meterStatus;

          const occRes = resolveOccupancy({
            sensorStatus,
            occupancy,
            lastSeenTs: rec.rawPayload?.timestamp || current.timestamp,
            now: new Date(),
            scheduledStatus: current.scheduledStatus,
          });

          const usageFlag = evaluateUsageFlag({
            meterStatus,
            occupancyState: occRes.state,
            powerKw,
            baselinePowerKw: current.baselinePowerKw,
          });

          updatedRooms[roomIdx] = {
            ...current,
            powerKw,
            occupancy,
            occupancyState: occRes.state,
            unknownReason: occRes.unknownReason,
            sensorStatus,
            meterStatus,
            usageFlag,
            dataQuality: rec.classification === 'WARNING' ? 'WARNING' : 'HEALTHY',
            timestamp: rec.rawPayload?.timestamp || current.timestamp,
          };
        } else if (rec.classification === 'REJECTED' || rec.classification === 'QUARANTINED') {
          // Last record was invalid/quarantined -> UNRELIABLE data quality (§8.9)
          updatedRooms[roomIdx] = {
            ...current,
            dataQuality: 'UNRELIABLE',
          };
        }
      }
    }
    setRooms(updatedRooms);

    const auditEvt = createAuditEvent({
      action: report.fileStatus === 'FILE_REJECTED' ? 'FILE_REJECTED' : 'FILE_VALIDATED',
      target: report.fileName,
      reason: `Ingestion validation report: ${report.totals.total} total (${report.totals.accepted} accepted, ${report.totals.warning} warning, ${report.totals.duplicate} duplicate, ${report.totals.rejected} rejected, ${report.totals.quarantined} quarantined).`,
      afterReading: report.totals,
      counter: auditEvents.length + 1,
    });
    setAuditEvents((prev) => [auditEvt, ...prev]);

    showToast(
      report.fileStatus === 'FILE_REJECTED'
        ? `File Rejected: ${report.fileError}`
        : `Ingestion completed: ${report.totals.accepted} accepted, ${report.totals.rejected} rejected, ${report.totals.quarantined} quarantined.`,
      report.fileStatus === 'FILE_REJECTED' ? 'critical' : 'info'
    );
  };

  // Booking actions
  const addBookingRequest = (req: Omit<BookingRequest, 'id'>) => {
    const newId = `BK-${String(bookingRequests.length + 1).padStart(3, '0')}`;
    const newReq: BookingRequest = { ...req, id: newId };
    setBookingRequests((prev) => [newReq, ...prev]);
    showToast(`Booking request ${newId} submitted for ${req.roomId}`, 'info');
  };

  const updateBookingStatus = (id: string, status: BookingRequest['status'], adminNotes?: string) => {
    setBookingRequests((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, adminNotes: adminNotes || b.adminNotes } : b))
    );
    showToast(`Booking ${id} marked ${status}`, 'success');
  };

  // Maintenance actions
  const addMaintenanceItem = (item: Omit<MaintenanceItem, 'id' | 'reportedAt'>) => {
    const newId = `MNT-${String(maintenanceItems.length + 1).padStart(3, '0')}`;
    const newItem: MaintenanceItem = {
      ...item,
      id: newId,
      reportedAt: new Date().toISOString(),
    };
    setMaintenanceItems((prev) => [newItem, ...prev]);
    showToast(`Maintenance ticket ${newId} created for ${item.roomId}`, 'success');
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceItem['status']) => {
    setMaintenanceItems((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              resolvedAt: status === 'COMPLETED' ? new Date().toISOString() : m.resolvedAt,
            }
          : m
      )
    );
    showToast(`Maintenance ${id} updated to ${status}`, 'info');
  };

  // ==========================================
  // 5 DEMONSTRATION SCENARIOS (MASTER.md §18)
  // ==========================================
  const loadScenario = (scenarioNum: number) => {
    // Clean seed reset first
    const freshRooms = getInitialSeedRooms();
    const freshEquip = getInitialSeedEquipment();
    const freshLoads = getInitialSeedLoads();

    if (scenarioNum === 1) {
      // Scenario 1: Normal Campus Baseline
      setRooms(freshRooms);
      setEquipment(freshEquip);
      setLoads(freshLoads);
      setScenarioInputs({
        baselineDemandKw: 100,
        multiplier: 3.0,
        capacityPercent: 50,
        emergencyDurationHours: 1,
      });
      setActiveScenarioId('scenario-1');
      showToast('Scenario 1: Normal Campus profile loaded (31.3 kW demand, 6.0 kW avoidable).', 'info');
    } else if (scenarioNum === 2) {
      // Scenario 2: Emergency Demand Surge (3x demand, 50% capacity)
      setRooms(freshRooms);
      setEquipment(freshEquip);
      setLoads(freshLoads);
      setScenarioInputs({
        baselineDemandKw: 100,
        multiplier: 3.0,
        capacityPercent: 50,
        emergencyDurationHours: 1,
      });
      setActiveScenarioId('scenario-2');
      setActivePage('planner');
      showToast('Scenario 2: Emergency Demand Surge active (300 kW demand, 50 kW capacity, SEVERE).', 'warning');
    } else if (scenarioNum === 3) {
      // Scenario 3: Critical Equipment Shield (Add EQ-002 to A-102)
      setRooms(freshRooms);
      const eq2: EquipmentRecord = {
        equipmentId: 'EQ-002',
        name: 'Server rack R2 (High Compute)',
        buildingId: 'A',
        roomId: 'A-102',
        category: 'SERVER',
        protected: true,
        active: true,
        minimumOperatingKw: 2.5,
        reasonForProtection: 'Backup academic credential database node',
      };
      setEquipment([...freshEquip, eq2]);
      setLoads(freshLoads);
      setActiveScenarioId('scenario-3');
      setActivePage('intelligence');
      showToast('Scenario 3: Protected Equipment EQ-002 attached to A-102. Shutdown recommendations now PROTECTED.', 'info');
    } else if (scenarioNum === 4) {
      // Scenario 4: Malicious & Invalid Data Ingestion
      setRooms(freshRooms);
      setEquipment(freshEquip);
      setLoads(freshLoads);
      setActiveScenarioId('scenario-4');
      setActivePage('data-integrity');
      showToast('Scenario 4: Ready for Ingestion Security validation. Load combined bad-data demo.', 'info');
    } else if (scenarioNum === 5) {
      // Scenario 5: Approval and Verification Workflow
      setRooms(freshRooms);
      setEquipment(freshEquip);
      setLoads(freshLoads);
      setActiveScenarioId('scenario-5');
      setActivePage('intelligence');
      showToast('Scenario 5: Open A-102 recommendation, Approve, then Apply simulated action to verify.', 'info');
    }
  };

  const resetDemo = () => {
    setRooms(getInitialSeedRooms());
    setEquipment(getInitialSeedEquipment());
    setLoads(getInitialSeedLoads());
    setScenarioInputs({
      baselineDemandKw: CONFIG.defaultBaselineDemandKw,
      multiplier: CONFIG.defaultDemandMultiplier,
      capacityPercent: CONFIG.defaultCapacityPercent,
      emergencyDurationHours: CONFIG.emergencyDurationHours,
    });
    setLatestValidationReport(null);
    setPlanApproved(false);
    setActiveScenarioId('scenario-1');
    const resetEvt = createAuditEvent({
      action: 'DEMO_RESET',
      reason: 'Administrator confirmed full demo reset. All overrides restored to initial seed dataset.',
      counter: auditEvents.length + 1,
    });
    setAuditEvents([resetEvt]);
    showToast('Demo reset complete. Pristine simulated seed restored.', 'success');
  };

  return (
    <AppStateContext.Provider
      value={{
        theme,
        currentUser,
        activePage,
        rooms,
        equipment,
        loads,
        scenarioInputs,
        allocationPlan,
        manualLoadOverrides,
        recommendations,
        auditEvents,
        bookingRequests,
        maintenanceItems,
        latestValidationReport,
        activeScenarioId,
        selectedRoomId,
        toast,
        kpis,
        planApproved,
        alertPopupOpen,
        customScenarios,
        toggleTheme,
        setAlertPopupOpen,
        login,
        logout,
        setActivePage,
        setSelectedRoomId,
        showToast,
        updateScenarioInputs,
        runAllocation,
        approvePlan,
        rejectPlan,
        updateLoadAllocation,
        resetLoadOverrides,
        approveRecommendation,
        rejectRecommendation,
        markFalseAlarm,
        remediateQuarantinedRecord,
        applyRecommendation,
        verifySavings,
        toggleEquipmentProtection,
        addEquipment,
        toggleRoomMaintenance,
        applyValidationResults,
        addBookingRequest,
        updateBookingStatus,
        addMaintenanceItem,
        updateMaintenanceStatus,
        loadScenario,
        saveCustomScenario,
        updateCustomScenario,
        deleteCustomScenario,
        resetDemo,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
