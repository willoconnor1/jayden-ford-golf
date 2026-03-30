import { ShotData, Club, ShotLie, Round } from "@/lib/types";

// ── New types for redesigned dispersion ──────────────────────────

export interface EnrichedTeeShot extends ShotData {
  roundId: string;
  roundDate: string;
  courseName: string;
  holeNumber: number;
  holeDistance: number;
  distanceHit: number; // yards: holeDistance - distanceRemaining
}

export interface EnrichedApproachShot extends ShotData {
  roundId: string;
  roundDate: string;
  courseName: string;
  holeNumber: number;
}

export interface RoundSelection {
  mode: "all" | "lastN" | "custom";
  lastN: number;
  roundIds: string[];
}

export type TeeViewMode = "scatter" | "heatmap" | "beeswarm" | "histogram";

export interface HeatmapCell {
  col: number;
  row: number;
  count: number;
  opacity: number;
}

export interface HistogramBin {
  rangeStart: number;
  rangeEnd: number;
  label: string;
  clubCounts: Record<string, number>;
  total: number;
}

export interface DispersionStats {
  shotCount: number;
  avgMissX: number;
  avgMissY: number;
  avgMissDistance: number;
  dispersionRadius80: number; // radius capturing 80% of shots
  pctLeft: number;
  pctRight: number;
  pctShort: number;
  pctLong: number;
  avgTargetDistance: number;
}

/** Collect all shots from rounds, optionally filtering by club and lie */
export function collectShots(
  rounds: Round[],
  clubFilter?: Club | "all",
  lieFilter?: ShotLie | "all"
): ShotData[] {
  const shots: ShotData[] = [];
  for (const round of rounds) {
    for (const hole of round.holes) {
      if (!hole.shots) continue;
      for (const shot of hole.shots) {
        if (clubFilter && clubFilter !== "all" && shot.club !== clubFilter) continue;
        if (lieFilter && lieFilter !== "all" && shot.lie !== lieFilter) continue;
        shots.push(shot);
      }
    }
  }
  return shots;
}

/** Calculate dispersion stats from a list of shots */
export function calculateDispersion(shots: ShotData[]): DispersionStats | null {
  if (shots.length === 0) return null;

  const n = shots.length;
  let sumX = 0;
  let sumY = 0;
  let sumDist = 0;
  let sumTarget = 0;
  let leftCount = 0;
  let rightCount = 0;
  let shortCount = 0;
  let longCount = 0;

  const distances: number[] = [];

  for (const shot of shots) {
    const dist = Math.sqrt(shot.missX * shot.missX + shot.missY * shot.missY);
    sumX += shot.missX;
    sumY += shot.missY;
    sumDist += dist;
    sumTarget += shot.targetDistance;
    distances.push(dist);

    if (shot.missX < 0) leftCount++;
    if (shot.missX > 0) rightCount++;
    if (shot.missY < 0) shortCount++;
    if (shot.missY > 0) longCount++;
  }

  // 80th percentile radius
  distances.sort((a, b) => a - b);
  const p80Index = Math.floor(n * 0.8) - 1;
  const dispersionRadius80 = distances[Math.max(0, p80Index)];

  return {
    shotCount: n,
    avgMissX: sumX / n,
    avgMissY: sumY / n,
    avgMissDistance: sumDist / n,
    dispersionRadius80,
    pctLeft: (leftCount / n) * 100,
    pctRight: (rightCount / n) * 100,
    pctShort: (shortCount / n) * 100,
    pctLong: (longCount / n) * 100,
    avgTargetDistance: sumTarget / n,
  };
}

/** Get unique clubs from all rounds' shot data */
export function getUsedClubs(rounds: Round[]): Club[] {
  const clubSet = new Set<Club>();
  for (const round of rounds) {
    for (const hole of round.holes) {
      if (!hole.shots) continue;
      for (const shot of hole.shots) {
        clubSet.add(shot.club);
      }
    }
  }
  return Array.from(clubSet);
}

/** Get unique lies from all rounds' shot data */
export function getUsedLies(rounds: Round[]): ShotLie[] {
  const lieSet = new Set<ShotLie>();
  for (const round of rounds) {
    for (const hole of round.holes) {
      if (!hole.shots) continue;
      for (const shot of hole.shots) {
        lieSet.add(shot.lie);
      }
    }
  }
  return Array.from(lieSet);
}

// ── New functions for redesigned dispersion ──────────────────────

/** Filter rounds by lastN (sorted by date desc) or specific round IDs */
export function filterRoundsBySelection(
  rounds: Round[],
  selection: RoundSelection
): Round[] {
  if (selection.mode === "all") return rounds;
  if (selection.mode === "custom" && selection.roundIds.length > 0) {
    const idSet = new Set(selection.roundIds);
    return rounds.filter((r) => idSet.has(r.id));
  }
  // lastN mode
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted.slice(0, selection.lastN);
}

/** Filter rounds by course names (empty = all courses) */
export function filterRoundsByCourse(
  rounds: Round[],
  courseNames: string[]
): Round[] {
  if (courseNames.length === 0) return rounds;
  const nameSet = new Set(courseNames);
  return rounds.filter((r) => nameSet.has(r.course.name));
}

/** Collect tee shots enriched with distance data */
export function collectTeeShots(
  rounds: Round[],
  selectedClubs: Club[]
): EnrichedTeeShot[] {
  const clubSet = new Set(selectedClubs);
  const shots: EnrichedTeeShot[] = [];

  for (const round of rounds) {
    for (const hole of round.holes) {
      if (!hole.shots) continue;
      if (hole.par === 3) continue;
      for (const shot of hole.shots) {
        if (shot.lie !== "tee") continue;
        if (clubSet.size > 0 && !clubSet.has(shot.club)) continue;

        const holeDistance = hole.distance;
        const distanceHit =
          shot.distanceRemaining != null
            ? holeDistance - shot.distanceRemaining
            : shot.targetDistance;

        shots.push({
          ...shot,
          roundId: round.id,
          roundDate: round.date,
          courseName: round.course.name,
          holeNumber: hole.holeNumber,
          holeDistance,
          distanceHit: Math.max(0, distanceHit),
        });
      }
    }
  }
  return shots;
}

/** Collect approach (non-tee) shots */
export function collectApproachShots(
  rounds: Round[],
  selectedClubs: Club[],
  selectedLies: ShotLie[]
): EnrichedApproachShot[] {
  const clubSet = new Set(selectedClubs);
  const lieSet = new Set(selectedLies);
  const shots: EnrichedApproachShot[] = [];

  for (const round of rounds) {
    for (const hole of round.holes) {
      if (!hole.shots) continue;
      for (const shot of hole.shots) {
        if (shot.lie === "tee") continue;
        if (clubSet.size > 0 && !clubSet.has(shot.club)) continue;
        if (lieSet.size > 0 && !lieSet.has(shot.lie)) continue;

        shots.push({
          ...shot,
          roundId: round.id,
          roundDate: round.date,
          courseName: round.course.name,
          holeNumber: hole.holeNumber,
        });
      }
    }
  }
  return shots;
}

/** Get sorted unique course names from rounds */
export function getUniqueCourseNames(rounds: Round[]): string[] {
  const names = new Set<string>();
  for (const round of rounds) {
    names.add(round.course.name);
  }
  return Array.from(names).sort();
}

/** Compute 2D heatmap grid cell densities */
export function computeHeatmapGrid(
  shots: { missX: number; distanceHit?: number; missY?: number }[],
  gridCols: number,
  gridRows: number,
  xRange: [number, number],
  yRange: [number, number],
  yKey: "distanceHit" | "missY" = "distanceHit"
): HeatmapCell[] {
  const cellCounts: number[][] = Array.from({ length: gridRows }, () =>
    Array(gridCols).fill(0)
  );

  const xSpan = xRange[1] - xRange[0];
  const ySpan = yRange[1] - yRange[0];

  for (const shot of shots) {
    const x = shot.missX;
    const y = yKey === "distanceHit" ? (shot as any).distanceHit ?? 0 : shot.missY ?? 0;

    const col = Math.floor(((x - xRange[0]) / xSpan) * gridCols);
    const row = Math.floor(((y - yRange[0]) / ySpan) * gridRows);

    const clampedCol = Math.max(0, Math.min(gridCols - 1, col));
    const clampedRow = Math.max(0, Math.min(gridRows - 1, row));
    cellCounts[clampedRow][clampedCol]++;
  }

  const maxCount = Math.max(1, ...cellCounts.flat());
  const cells: HeatmapCell[] = [];

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (cellCounts[r][c] > 0) {
        cells.push({
          row: r,
          col: c,
          count: cellCounts[r][c],
          opacity: (cellCounts[r][c] / maxCount) * 0.8,
        });
      }
    }
  }
  return cells;
}

/** Compute histogram bins for left/right miss, per club */
export function computeHistogramBins(
  shots: { missX: number; club: Club }[],
  binWidth: number = 10
): HistogramBin[] {
  if (shots.length === 0) return [];

  const maxAbs = Math.max(10, ...shots.map((s) => Math.abs(s.missX)));
  const binCount = Math.ceil(maxAbs / binWidth) * 2;
  const start = -Math.ceil(maxAbs / binWidth) * binWidth;

  const bins: HistogramBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const rangeStart = start + i * binWidth;
    const rangeEnd = rangeStart + binWidth;
    bins.push({
      rangeStart,
      rangeEnd,
      label: rangeStart >= 0 ? `${rangeStart}` : `${rangeStart}`,
      clubCounts: {},
      total: 0,
    });
  }

  for (const shot of shots) {
    const idx = Math.floor((shot.missX - start) / binWidth);
    const clampedIdx = Math.max(0, Math.min(bins.length - 1, idx));
    bins[clampedIdx].clubCounts[shot.club] =
      (bins[clampedIdx].clubCounts[shot.club] ?? 0) + 1;
    bins[clampedIdx].total++;
  }

  return bins;
}

/** Get top N most used clubs from rounds */
export function getTopUsedClubs(rounds: Round[], n: number): Club[] {
  const counts = new Map<Club, number>();
  for (const round of rounds) {
    for (const hole of round.holes) {
      if (!hole.shots) continue;
      for (const shot of hole.shots) {
        counts.set(shot.club, (counts.get(shot.club) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([club]) => club);
}
