// ZHATKA Defaults and Config Constants (MASTER.md Section 7, 8, 9, 14, 24)

export const CONFIG = {
  // Usage flags thresholds (§7.4)
  highRatio: 1.5,
  highMinKw: 0.3,
  emptyExcessMinKw: 0.5,

  // Freshness threshold (§7.3)
  freshnessMinutes: 60,

  // Savings and verification assumptions (§11.2, §24)
  estimatedDurationHours: 4,
  verificationWindowHours: 4,
  simulatedResidualKw: 0.3, // default residual kW after shutdown action

  // Economics & Environmental assumptions (DESIGN.md 6.9, MASTER A9)
  tariffPerKwhInr: 9.50, // INR / kWh
  emissionFactorKgPerKwh: 0.82, // kg CO2 / kWh

  // Emergency planner defaults (§9.1)
  defaultBaselineDemandKw: 100,
  defaultDemandMultiplier: 3.0,
  defaultCapacityPercent: 50,
  emergencyDurationHours: 1,

  // Severity thresholds (§9.1)
  severityCutoffs: {
    normal: 1.0,      // supplyRatio >= 1.0
    caution: 0.75,    // 0.75 <= supplyRatio < 1.0
    shortage: 0.40,   // 0.40 <= supplyRatio < 0.75
    // severe < 0.40
  },

  // Ingestion validation limits (§8.1)
  maxFileSizeBytes: 1024 * 1024, // 1 MB
  maxRows: 5000,
  maxStringLength: 64,
  maxNoteLength: 200,
  maxFileNameLength: 100,

  // Audit and duplicate key storage limits (§8.3, §11.1)
  maxAuditEvents: 1000,
  maxDuplicateKeys: 10000,

  // Seed baseline capacity
  originalCapacityKw: 100,
};
