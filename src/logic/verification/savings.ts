import { CONFIG } from '../../config/defaults.ts';

export interface SavingsVerificationResult {
  windowHours: number;
  beforePowerKw: number;
  afterPowerKw: number;
  baselineEnergyKwh: number;
  previousEnergyKwh: number;
  postActionEnergyKwh: number;
  measuredSavingsKwh: number;
  potentialKw: number;
  estimatedKwh: number;
  formulaStr: string;
  isComparable: boolean;
  comparableNote?: string;
}

/**
 * Calculates before/after savings verification strictly distinguishing
 * Potential (kW), Estimated (kWh), and Measured Simulated (kWh)
 * adhering to MASTER.md §11.2 & §18 Scenario 5.
 */
export function calculateMeasuredSavings({
  beforePowerKw,
  afterPowerKw,
  previousPowerKw = beforePowerKw,
  baselinePowerKw,
  windowHours = CONFIG.verificationWindowHours,
  estimatedDurationHours = CONFIG.estimatedDurationHours,
}: {
  beforePowerKw: number;
  afterPowerKw: number;
  previousPowerKw?: number;
  baselinePowerKw: number;
  windowHours?: number;
  estimatedDurationHours?: number;
}): SavingsVerificationResult {
  const potentialKw = Math.max(0, beforePowerKw - baselinePowerKw);
  const estimatedKwh = Math.round(potentialKw * estimatedDurationHours * 10) / 10;

  // Over window W hours:
  const baselineEnergyKwh = Math.round(beforePowerKw * windowHours * 10) / 10;
  const previousEnergyKwh = Math.round(previousPowerKw * windowHours * 10) / 10;
  const postActionEnergyKwh = Math.round(afterPowerKw * windowHours * 10) / 10;
  const measuredSavingsKwh = Math.round((baselineEnergyKwh - postActionEnergyKwh) * 10) / 10;

  const formulaStr = `${baselineEnergyKwh.toFixed(1)} kWh (baseline) − ${postActionEnergyKwh.toFixed(1)} kWh (post-action) = ${measuredSavingsKwh.toFixed(1)} kWh`;

  return {
    windowHours,
    beforePowerKw,
    afterPowerKw,
    baselineEnergyKwh,
    previousEnergyKwh,
    postActionEnergyKwh,
    measuredSavingsKwh,
    potentialKw: Math.round(potentialKw * 10) / 10,
    estimatedKwh,
    formulaStr,
    isComparable: true,
  };
}
