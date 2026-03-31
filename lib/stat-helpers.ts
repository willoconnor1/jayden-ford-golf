import { Round, RoundStats, AggregateStats, StatCategory } from "@/lib/types";
import { STAT_DIRECTION, PGA_TOUR_AVERAGES, STAT_LABELS, formatStat } from "@/lib/constants";

// Maps StatCategory to the corresponding field on RoundStats
const STAT_TO_ROUND_FIELD: Record<string, keyof RoundStats> = {
  scoringAverage: "totalScore",
  fairwayPercentage: "fairwayPercentage",
  girPercentage: "girPercentage",
  puttsPerRound: "totalPutts",
  puttsPerGir: "puttsPerGir",
  upAndDownPercentage: "upAndDownPercentage",
  sandSavePercentage: "sandSavePercentage",
  scramblingPercentage: "scramblingPercentage",
};

// Maps StatCategory to the corresponding field on AggregateStats
const STAT_TO_AGGREGATE_FIELD: Record<string, keyof AggregateStats> = {
  scoringAverage: "scoringAverage",
  fairwayPercentage: "fairwayPercentage",
  girPercentage: "girPercentage",
  puttsPerRound: "puttsPerRound",
  puttsPerGir: "puttsPerGir",
  upAndDownPercentage: "upAndDownPercentage",
  sandSavePercentage: "sandSavePercentage",
  scramblingPercentage: "scramblingPercentage",
};

// The 8 stats shown as cards on the dashboard
export const DASHBOARD_STATS: StatCategory[] = [
  "scoringAverage",
  "fairwayPercentage",
  "girPercentage",
  "puttsPerRound",
  "puttsPerGir",
  "upAndDownPercentage",
  "sandSavePercentage",
  "scramblingPercentage",
];

export interface PerRoundDataPoint {
  roundIndex: number;
  date: string;
  value: number;
  pgaAverage: number;
}

/**
 * Extract per-round data points for any stat in chronological order.
 * roundStats should be sorted newest-first (as returned by useStats).
 */
export function getPerRoundChartData(
  roundStats: Array<{ round: Round; stats: RoundStats }>,
  stat: StatCategory,
  lastN?: number
): PerRoundDataPoint[] {
  const fieldKey = STAT_TO_ROUND_FIELD[stat];
  if (!fieldKey) return [];

  const sliced = lastN ? roundStats.slice(0, lastN) : roundStats;
  const pgaAvg = PGA_TOUR_AVERAGES[stat] ?? 0;

  const chronological = [...sliced].reverse();

  // Show cumulative running average for all stats
  let runningTotal = 0;
  return chronological.map((rs, idx) => {
    runningTotal += rs.stats[fieldKey] as number;
    return {
      roundIndex: idx + 1,
      date: rs.round.date,
      value: runningTotal / (idx + 1),
      pgaAverage: pgaAvg,
    };
  });
}

/**
 * Determine if the user is trending in the "good" direction
 * using simple linear regression slope.
 */
export function isTrendImproving(
  data: PerRoundDataPoint[],
  stat: StatCategory
): boolean {
  if (data.length < 2) return false;

  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i].value;
    sumXY += i * data[i].value;
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const direction = STAT_DIRECTION[stat];
  if (direction === "increase") return slope > 0;
  return slope < 0; // "decrease" means lower is better
}

/** Whether a user's aggregate value is better than PGA Tour average. */
export function isBetterThanPga(value: number, stat: StatCategory): boolean {
  const pgaAvg = PGA_TOUR_AVERAGES[stat];
  if (pgaAvg === undefined) return false;
  const direction = STAT_DIRECTION[stat];
  return direction === "increase" ? value > pgaAvg : value < pgaAvg;
}

/** Get the aggregate value for a stat from AggregateStats. */
export function getAggregateValue(stats: AggregateStats, stat: StatCategory): number {
  const key = STAT_TO_AGGREGATE_FIELD[stat];
  if (!key) return 0;
  return stats[key] as number;
}

/** Get formatted display value for a stat. */
export function getFormattedValue(stats: AggregateStats, stat: StatCategory): string {
  return formatStat(getAggregateValue(stats, stat), stat);
}

/** Get formatted PGA Tour average for a stat. */
export function getFormattedPga(stat: StatCategory): string | undefined {
  const pgaAvg = PGA_TOUR_AVERAGES[stat];
  if (pgaAvg === undefined) return undefined;
  return formatStat(pgaAvg, stat);
}

export { STAT_LABELS, STAT_DIRECTION, PGA_TOUR_AVERAGES, formatStat };
