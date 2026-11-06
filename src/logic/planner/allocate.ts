import { CONFIG } from '../../config/defaults.ts';
import {
  AllocatedLoadItem,
  AllocationPlanResult,
  LoadRecord,
  ScenarioInputs,
  SeverityLevel,
} from '../../types/index.ts';

export function calculateSeverity(supplyRatio: number): SeverityLevel {
  if (supplyRatio >= CONFIG.severityCutoffs.normal) return 'NORMAL';
  if (supplyRatio >= CONFIG.severityCutoffs.caution) return 'CAUTION';
  if (supplyRatio >= CONFIG.severityCutoffs.shortage) return 'SHORTAGE';
  return 'SEVERE';
}

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

export function computeScenarioMetrics(inputs: ScenarioInputs) {
  const baselineDemandKw = Math.max(1, inputs.baselineDemandKw);
  const multiplier = Math.max(0.1, inputs.multiplier);
  const capacityPercent = Math.max(1, Math.min(100, inputs.capacityPercent));

  const originalCapacityKw = baselineDemandKw;
  const availableKw = round2((originalCapacityKw * capacityPercent) / 100);
  const currentDemandKw = round2(baselineDemandKw * multiplier);
  const deficitKw = round2(Math.max(0, currentDemandKw - availableKw));
  const supplyRatio = currentDemandKw > 0 ? availableKw / currentDemandKw : 1;
  const severity = calculateSeverity(supplyRatio);

  return {
    baselineDemandKw,
    multiplier,
    capacityPercent,
    originalCapacityKw,
    availableKw,
    currentDemandKw,
    deficitKw,
    supplyRatio,
    severity,
  };
}

/**
 * Deterministic Adaptive Resource Allocator (MASTER.md §9.6)
 */
export function allocateLoads(
  rawLoads: LoadRecord[],
  inputs: ScenarioInputs
): AllocationPlanResult {
  const metrics = computeScenarioMetrics(inputs);
  const { currentDemandKw, availableKw } = metrics;

  // Scale loads to match currentDemandKw (§9.5)
  const fixedKw = rawLoads
    .filter((l) => l.priority === 'P0' || l.protected)
    .reduce((sum, l) => sum + l.requestedKw, 0);

  const refOtherKw = rawLoads
    .filter((l) => !(l.priority === 'P0' || l.protected))
    .reduce((sum, l) => sum + l.requestedKw, 0);

  const scale = refOtherKw > 0 ? Math.max(0, (currentDemandKw - fixedKw) / refOtherKw) : 0;

  const loadsWithScaled: {
    load: LoadRecord;
    scaledRequestedKw: number;
    effectiveMinKw: number;
    mandatoryKw: number;
  }[] = rawLoads.map((load) => {
    const isFixed = load.priority === 'P0' || load.protected;
    const scaledRequestedKw = isFixed ? load.requestedKw : round2(load.requestedKw * scale);
    const effectiveMinKw = Math.min(load.minimumKw, scaledRequestedKw);

    // Mandatory reserve calculation per category (§9.6 Steps 2-5):
    let mandatoryKw = 0;
    if (load.priority === 'P0' || load.protected) {
      mandatoryKw = scaledRequestedKw; // Reserve P0 / protected in full
    } else if (load.priority === 'P1' || load.priority === 'P2') {
      mandatoryKw = effectiveMinKw; // Reserve P1 & P2 minimums
    } else if (load.priority === 'P3') {
      mandatoryKw = load.deferrable ? 0 : effectiveMinKw;
    }

    return {
      load,
      scaledRequestedKw,
      effectiveMinKw,
      mandatoryKw,
    };
  });

  const mandatoryTotalKw = round2(
    loadsWithScaled.reduce((sum, item) => sum + item.mandatoryKw, 0)
  );

  const p0Full = round2(loadsWithScaled.filter(i => i.load.priority === 'P0' || i.load.protected).reduce((s, i) => s + i.scaledRequestedKw, 0));
  const p1Min = round2(loadsWithScaled.filter(i => i.load.priority === 'P1' && !i.load.protected).reduce((s, i) => s + i.effectiveMinKw, 0));
  const p2Min = round2(loadsWithScaled.filter(i => i.load.priority === 'P2').reduce((s, i) => s + i.effectiveMinKw, 0));
  const p3NonDeferrableMin = round2(loadsWithScaled.filter(i => i.load.priority === 'P3' && !i.load.deferrable).reduce((s, i) => s + i.effectiveMinKw, 0));

  const conflictBreakdown = {
    p0Full,
    p1Min,
    p2Min,
    p3NonDeferrableMin,
    subtotal: mandatoryTotalKw,
    capacity: availableKw,
    shortfall: round2(Math.max(0, mandatoryTotalKw - availableKw)),
    minFeasiblePercent: round2((mandatoryTotalKw / metrics.originalCapacityKw) * 100),
  };

  // Step 6: Feasibility Check
  if (mandatoryTotalKw > availableKw + 1e-9) {
    // Infeasible state: Never reduce protected or minimum loads to fit (§9.8)
    const infeasibleLoads: AllocatedLoadItem[] = loadsWithScaled.map((item) => ({
      ...item.load,
      scaledRequestedKw: item.scaledRequestedKw,
      effectiveMinKw: item.effectiveMinKw,
      allocatedKw: 0,
      reducedKw: 0,
      deferredKw: 0,
      unmetKw: item.scaledRequestedKw,
      status: 'NOT_ALLOCATED',
      explanation: 'Allocation blocked: mandatory requirements exceed available capacity.',
    }));

    return {
      feasible: false,
      ...metrics,
      mandatoryTotalKw,
      shortfallKw: conflictBreakdown.shortfall,
      allocatedTotalKw: 0,
      unmetTotalKw: round2(loadsWithScaled.reduce((s, i) => s + i.scaledRequestedKw, 0)),
      utilisationRatio: 0,
      loads: infeasibleLoads,
      conflictBreakdown,
      categoryTotals: {
        P0: { requested: p0Full, allocated: 0, unmet: p0Full },
        P1: { requested: round2(loadsWithScaled.filter(i => i.load.priority === 'P1').reduce((s, i) => s + i.scaledRequestedKw, 0)), allocated: 0, unmet: round2(loadsWithScaled.filter(i => i.load.priority === 'P1').reduce((s, i) => s + i.scaledRequestedKw, 0)) },
        P2: { requested: round2(loadsWithScaled.filter(i => i.load.priority === 'P2').reduce((s, i) => s + i.scaledRequestedKw, 0)), allocated: 0, unmet: round2(loadsWithScaled.filter(i => i.load.priority === 'P2').reduce((s, i) => s + i.scaledRequestedKw, 0)) },
        P3: { requested: round2(loadsWithScaled.filter(i => i.load.priority === 'P3').reduce((s, i) => s + i.scaledRequestedKw, 0)), allocated: 0, unmet: round2(loadsWithScaled.filter(i => i.load.priority === 'P3').reduce((s, i) => s + i.scaledRequestedKw, 0)) },
      },
    };
  }

  // Step 7: Feasible! Start each load with mandatory allocation
  const allocatedMap = new Map<string, number>();
  loadsWithScaled.forEach((item) => {
    allocatedMap.set(item.load.loadId, item.mandatoryKw);
  });

  let remaining = round2(availableKw - mandatoryTotalKw);

  // Step 8: Distribute remaining capacity by priority
  // Order: priority P0 -> P1 -> P2 -> P3, then sortOrder, then loadId
  const priorityWeight: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

  const sortedItems = [...loadsWithScaled].sort((a, b) => {
    const pA = priorityWeight[a.load.priority] ?? 4;
    const pB = priorityWeight[b.load.priority] ?? 4;
    if (pA !== pB) return pA - pB;
    if (a.load.sortOrder !== b.load.sortOrder) return a.load.sortOrder - b.load.sortOrder;
    return a.load.loadId.localeCompare(b.load.loadId);
  });

  for (const item of sortedItems) {
    if (remaining <= 0.001) break;
    const currentAlloc = allocatedMap.get(item.load.loadId) || 0;
    const needed = item.scaledRequestedKw - currentAlloc;
    if (needed > 0.001) {
      const topUp = round2(Math.min(needed, remaining));
      allocatedMap.set(item.load.loadId, round2(currentAlloc + topUp));
      remaining = round2(remaining - topUp);
    }
  }

  // Step 10: Per-load accounting (5 distinct numbers: requested, minimum, allocated, reduced, deferred, unmet)
  const allocatedLoads: AllocatedLoadItem[] = loadsWithScaled.map((item) => {
    const allocatedKw = round2(allocatedMap.get(item.load.loadId) || 0);
    const requestedKw = item.scaledRequestedKw;
    const isDeferred = allocatedKw === 0 && item.load.deferrable;
    const reducedKw = allocatedKw > 0 ? round2(Math.max(0, requestedKw - allocatedKw)) : 0;
    const deferredKw = isDeferred ? requestedKw : 0;
    const unmetKw = round2(reducedKw + deferredKw);

    let status: AllocatedLoadItem['status'] = 'FULL';
    if (allocatedKw === 0) {
      status = item.load.deferrable ? 'DEFERRED' : 'UNSERVED_WARNING';
    } else if (Math.abs(allocatedKw - requestedKw) < 0.01) {
      status = 'FULL';
    } else if (Math.abs(allocatedKw - item.effectiveMinKw) < 0.01) {
      status = 'AT_MINIMUM';
    } else {
      status = 'REDUCED';
    }

    let explanation = '';
    if (status === 'FULL') {
      explanation = 'Allocated in full per priority entitlement.';
    } else if (status === 'DEFERRED') {
      explanation = `P3 flexible and deferrable load; capacity prioritised for higher tiers. Deferring ${deferredKw} kW saves capacity for essential services.`;
    } else if (status === 'AT_MINIMUM') {
      explanation = `Scaled down to safe minimum floor (${item.effectiveMinKw} kW). Remaining requested power deferred.`;
    } else if (status === 'REDUCED') {
      explanation = `Preserved base minimum plus partial surplus top-up (${allocatedKw} kW of ${requestedKw} kW).`;
    }

    return {
      ...item.load,
      scaledRequestedKw: requestedKw,
      effectiveMinKw: item.effectiveMinKw,
      allocatedKw,
      reducedKw,
      deferredKw,
      unmetKw,
      status,
      explanation,
    };
  });

  const allocatedTotalKw = round2(allocatedLoads.reduce((s, l) => s + l.allocatedKw, 0));
  const unmetTotalKw = round2(allocatedLoads.reduce((s, l) => s + l.unmetKw, 0));
  const utilisationRatio = availableKw > 0 ? round2(allocatedTotalKw / availableKw) : 0;

  // Category totals
  const getCatTotals = (p: string) => {
    const catLoads = allocatedLoads.filter(l => l.priority === p);
    return {
      requested: round2(catLoads.reduce((s, l) => s + l.scaledRequestedKw, 0)),
      allocated: round2(catLoads.reduce((s, l) => s + l.allocatedKw, 0)),
      unmet: round2(catLoads.reduce((s, l) => s + l.unmetKw, 0)),
    };
  };

  return {
    feasible: true,
    ...metrics,
    mandatoryTotalKw,
    shortfallKw: 0,
    allocatedTotalKw,
    unmetTotalKw,
    utilisationRatio,
    loads: allocatedLoads,
    conflictBreakdown,
    categoryTotals: {
      P0: getCatTotals('P0'),
      P1: getCatTotals('P1'),
      P2: getCatTotals('P2'),
      P3: getCatTotals('P3'),
    },
  };
}
