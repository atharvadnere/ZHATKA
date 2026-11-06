// Realistic 30-Day Simulated Historical Energy & Occupancy Telemetry

export interface HourlyDataPoint {
  hour: string; // e.g. "09:00"
  timestamp: string;
  measuredKw: number;
  baselineKw: number;
  occupancyCount: number;
  isPeak: boolean;
}

export interface DailyDataPoint {
  date: string; // e.g. "2026-11-05"
  dayLabel: string; // e.g. "Thu, Nov 5"
  dayOfWeek: string; // "Thu"
  totalKwh: number;
  baselineKwh: number;
  peakDemandKw: number;
  avgOccupancyPct: number;
  avoidableKwh: number;
}

export interface BuildingHistoricSummary {
  buildingId: string;
  name: string;
  monthTotalKwh: number;
  monthCostInr: number;
  co2Kg: number;
  peakKw: number;
  efficiencyScore: number;
}

// Generate deterministic 24-hour Day profile (Today)
export function getDay24HourData(baseDemandKw: number = 31.3): HourlyDataPoint[] {
  const hours = [
    { h: '00:00', loadFactor: 0.35, occ: 0, peak: false },
    { h: '01:00', loadFactor: 0.32, occ: 0, peak: false },
    { h: '02:00', loadFactor: 0.30, occ: 0, peak: false },
    { h: '03:00', loadFactor: 0.30, occ: 0, peak: false },
    { h: '04:00', loadFactor: 0.34, occ: 2, peak: false },
    { h: '05:00', loadFactor: 0.40, occ: 5, peak: false },
    { h: '06:00', loadFactor: 0.52, occ: 12, peak: false },
    { h: '07:00', loadFactor: 0.68, occ: 28, peak: false },
    { h: '08:00', loadFactor: 0.95, occ: 55, peak: true },
    { h: '09:00', loadFactor: 1.15, occ: 82, peak: true },
    { h: '10:00', loadFactor: 1.28, occ: 95, peak: true },
    { h: '11:00', loadFactor: 1.32, occ: 105, peak: true },
    { h: '12:00', loadFactor: 1.10, occ: 74, peak: false },
    { h: '13:00', loadFactor: 0.92, occ: 50, peak: false },
    { h: '14:00', loadFactor: 1.25, occ: 90, peak: true },
    { h: '15:00', loadFactor: 1.20, occ: 88, peak: true },
    { h: '16:00', loadFactor: 1.05, occ: 68, peak: false },
    { h: '17:00', loadFactor: 0.85, occ: 42, peak: false },
    { h: '18:00', loadFactor: 0.70, occ: 30, peak: false },
    { h: '19:00', loadFactor: 0.58, occ: 18, peak: false },
    { h: '20:00', loadFactor: 0.50, occ: 10, peak: false },
    { h: '21:00', loadFactor: 0.45, occ: 5, peak: false },
    { h: '22:00', loadFactor: 0.40, occ: 2, peak: false },
    { h: '23:00', loadFactor: 0.36, occ: 0, peak: false },
  ];

  return hours.map((item) => {
    const measuredKw = Math.round(baseDemandKw * item.loadFactor * 10) / 10;
    const baselineKw = Math.round(baseDemandKw * 0.85 * (item.loadFactor > 0.8 ? 0.9 : 1.0) * 10) / 10;

    return {
      hour: item.h,
      timestamp: `2026-11-06T${item.h}:00Z`,
      measuredKw,
      baselineKw,
      occupancyCount: item.occ,
      isPeak: item.peak,
    };
  });
}

// Generate 7-Day Week profile (7D)
export function getWeek7DayData(baseDemandKw: number = 31.3): DailyDataPoint[] {
  const days = [
    { day: 'Fri (Today)', dow: 'Fri', multiplier: 1.05, occPct: 78, avoidableKw: 6.0 },
    { day: 'Thu', dow: 'Thu', multiplier: 1.12, occPct: 84, avoidableKw: 6.8 },
    { day: 'Wed', dow: 'Wed', multiplier: 1.18, occPct: 88, avoidableKw: 7.2 },
    { day: 'Tue', dow: 'Tue', multiplier: 1.10, occPct: 80, avoidableKw: 6.4 },
    { day: 'Mon', dow: 'Mon', multiplier: 1.02, occPct: 75, avoidableKw: 5.8 },
    { day: 'Sun', dow: 'Sun', multiplier: 0.45, occPct: 15, avoidableKw: 3.2 },
    { day: 'Sat', dow: 'Sat', multiplier: 0.55, occPct: 22, avoidableKw: 3.8 },
  ];

  return days.map((d, idx) => {
    const dailyKwh = Math.round(baseDemandKw * 24 * d.multiplier);
    const baseKwh = Math.round(dailyKwh * 0.88);
    const peakKw = Math.round(baseDemandKw * d.multiplier * 1.35 * 10) / 10;

    return {
      date: `2026-11-0${6 - idx}`,
      dayLabel: d.day,
      dayOfWeek: d.dow,
      totalKwh: dailyKwh,
      baselineKwh: baseKwh,
      peakDemandKw: peakKw,
      avgOccupancyPct: d.occPct,
      avoidableKwh: Math.round(d.avoidableKw * 4),
    };
  });
}

// Generate 30-Day Month profile (30D)
export function getMonth30DayData(baseDemandKw: number = 31.3): DailyDataPoint[] {
  const points: DailyDataPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const dayNum = 30 - i;
    const isWeekend = i % 7 === 0 || i % 7 === 6;
    const noise = Math.sin(i * 0.7) * 0.12;
    const multiplier = isWeekend ? 0.48 + noise * 0.5 : 1.08 + noise;

    const totalKwh = Math.round(baseDemandKw * 24 * multiplier);
    const baselineKwh = Math.round(totalKwh * 0.86);
    const peakDemandKw = Math.round(baseDemandKw * multiplier * 1.38 * 10) / 10;
    const avgOccupancyPct = isWeekend ? Math.round(18 + noise * 10) : Math.round(76 + noise * 20);
    const avoidableKwh = isWeekend ? 12 : Math.round(24 + noise * 8);

    points.push({
      date: `Oct/Nov Day ${dayNum}`,
      dayLabel: `Day ${dayNum}`,
      dayOfWeek: isWeekend ? 'Wkd' : 'Wkd',
      totalKwh,
      baselineKwh,
      peakDemandKw,
      avgOccupancyPct,
      avoidableKwh,
    });
  }

  return points;
}

// Building 30-day summaries
export function getBuildingHistoricalSummaries(): BuildingHistoricSummary[] {
  return [
    {
      buildingId: 'A',
      name: 'Academic Block A',
      monthTotalKwh: 12450,
      monthCostInr: 118275,
      co2Kg: 10209,
      peakKw: 28.5,
      efficiencyScore: 84,
    },
    {
      buildingId: 'B',
      name: 'Computer Science Block B',
      monthTotalKwh: 14820,
      monthCostInr: 140790,
      co2Kg: 12152,
      peakKw: 34.0,
      efficiencyScore: 88,
    },
    {
      buildingId: 'C',
      name: 'Lecture Hall Block C',
      monthTotalKwh: 8900,
      monthCostInr: 84550,
      co2Kg: 7298,
      peakKw: 22.0,
      efficiencyScore: 79,
    },
    {
      buildingId: 'D',
      name: 'Central Library Block D',
      monthTotalKwh: 9800,
      monthCostInr: 93100,
      co2Kg: 8036,
      peakKw: 18.5,
      efficiencyScore: 92,
    },
    {
      buildingId: 'L',
      name: 'Advanced Robotics Lab Block L',
      monthTotalKwh: 16500,
      monthCostInr: 156750,
      co2Kg: 13530,
      peakKw: 42.0,
      efficiencyScore: 76,
    },
  ];
}
