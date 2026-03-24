/**
 * Generate densified SG benchmark tables using cubic spline interpolation
 * from Broadie's anchor points. Run with: node scripts/generate-benchmarks.mjs
 */

// Natural cubic spline interpolation
function cubicSpline(xs, ys) {
  const n = xs.length - 1;
  const h = [];
  for (let i = 0; i < n; i++) h.push(xs[i + 1] - xs[i]);

  const alpha = [0];
  for (let i = 1; i < n; i++) {
    alpha.push((3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]));
  }

  const l = [1], mu = [0], z = [0];
  for (let i = 1; i < n; i++) {
    l.push(2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1]);
    mu.push(h[i] / l[i]);
    z.push((alpha[i] - h[i - 1] * z[i - 1]) / l[i]);
  }

  const c = new Array(n + 1).fill(0);
  const b = new Array(n).fill(0);
  const d = new Array(n).fill(0);

  l.push(1); z.push(0); c[n] = 0;
  for (let j = n - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (ys[j + 1] - ys[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  return function(x) {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n]) return ys[n];

    let i = 0;
    for (let j = 0; j < n; j++) {
      if (x >= xs[j] && x <= xs[j + 1]) { i = j; break; }
    }

    const dx = x - xs[i];
    return ys[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  };
}

// Ensure monotonically non-decreasing
function enforceMonotonic(entries) {
  for (let i = 1; i < entries.length; i++) {
    if (entries[i][1] < entries[i - 1][1]) {
      entries[i][1] = entries[i - 1][1] + 0.001;
    }
  }
  return entries;
}

function generateTable(anchors, minDist, maxDist, step = 1) {
  const xs = anchors.map(a => a[0]);
  const ys = anchors.map(a => a[1]);
  const spline = cubicSpline(xs, ys);

  const entries = [];
  for (let d = minDist; d <= maxDist; d += step) {
    const val = Math.round(spline(d) * 1000) / 1000;
    entries.push([d, val]);
  }
  return enforceMonotonic(entries);
}

function formatTable(name, entries) {
  const lines = [`export const ${name}: Record<number, number> = {`];
  const perLine = 5;
  for (let i = 0; i < entries.length; i += perLine) {
    const chunk = entries.slice(i, i + perLine);
    const parts = chunk.map(([d, v]) => `${d}: ${v.toFixed(3)}`);
    lines.push('  ' + parts.join(', ') + ',');
  }
  lines.push('};');
  return lines.join('\n');
}

// ── Anchor points from Broadie / ShotLink ──────────────────

const TEE_ANCHORS = [
  [100, 2.92], [150, 2.99], [200, 3.12], [250, 3.45], [300, 3.71],
  [350, 3.86], [400, 3.99], [420, 4.08], [440, 4.12], [460, 4.17],
  [480, 4.28], [500, 4.41], [520, 4.54], [540, 4.65], [560, 4.74],
  [580, 4.82], [600, 4.89],
];

const FAIRWAY_ANCHORS = [
  [1, 2.10], [5, 2.18], [10, 2.25], [15, 2.32],
  [20, 2.40], [30, 2.43], [40, 2.50], [50, 2.54], [60, 2.58],
  [70, 2.62], [80, 2.68], [90, 2.72], [100, 2.80], [110, 2.82],
  [120, 2.85], [130, 2.88], [140, 2.91], [150, 2.95], [160, 2.98],
  [170, 3.03], [180, 3.08], [190, 3.13], [200, 3.19], [210, 3.25],
  [220, 3.32], [230, 3.40], [240, 3.50], [250, 3.62], [260, 3.70],
  [280, 3.78], [300, 3.88], [325, 4.00], [350, 4.12], [400, 4.38],
  [450, 4.62], [500, 4.85], [550, 5.05], [600, 5.25],
];

const ROUGH_ANCHORS = [
  [1, 2.20], [5, 2.30], [10, 2.34],
  [20, 2.57], [30, 2.69], [40, 2.74], [50, 2.78],
  [60, 2.82], [70, 2.87], [80, 2.96], [90, 2.99], [100, 3.02],
  [110, 3.05], [120, 3.08], [130, 3.12], [140, 3.17], [150, 3.22],
  [160, 3.28], [170, 3.31], [180, 3.37], [190, 3.40], [200, 3.42],
  [220, 3.55], [240, 3.65], [260, 3.78], [280, 3.90], [300, 4.00],
  [325, 4.14], [350, 4.28], [400, 4.55], [450, 4.80], [500, 5.05],
  [550, 5.28], [600, 5.50],
];

// Sand anchors - fixed anomalies (90y was 3.21, 120y was 3.21 — smoothed)
const SAND_ANCHORS = [
  [1, 2.30], [5, 2.35], [10, 2.47], [15, 2.50], [20, 2.53],
  [25, 2.59], [30, 2.65], [35, 2.72], [40, 2.79], [50, 2.90],
  [60, 3.00], [70, 3.10], [80, 3.20], [90, 3.30], [100, 3.37],
  [120, 3.45], [140, 3.55], [160, 3.65], [180, 3.75], [200, 3.85],
  [250, 4.10], [300, 4.35],
];

// Recovery anchors - extended down to short distances
const RECOVERY_ANCHORS = [
  [1, 2.80], [5, 2.90], [10, 3.00], [15, 3.10], [20, 3.20],
  [30, 3.35], [40, 3.45], [50, 3.55], [60, 3.60], [70, 3.65],
  [80, 3.72], [90, 3.78], [100, 3.80], [150, 3.84], [200, 3.92],
  [250, 4.05], [300, 4.25], [350, 4.45], [400, 4.75], [500, 5.17],
];

// Green anchors (distance in feet)
const GREEN_ANCHORS = [
  [1, 1.001], [2, 1.009], [3, 1.053], [4, 1.147], [5, 1.256],
  [6, 1.357], [7, 1.443], [8, 1.500], [9, 1.556], [10, 1.626],
  [12, 1.700], [15, 1.790], [18, 1.840], [20, 1.878], [25, 1.934],
  [30, 1.978], [35, 2.020], [40, 2.055], [45, 2.095], [50, 2.135],
  [55, 2.175], [60, 2.218], [70, 2.290], [80, 2.350], [90, 2.400],
];

// Generate all tables
const tee = generateTable(TEE_ANCHORS, 100, 600);
const fairway = generateTable(FAIRWAY_ANCHORS, 1, 600);
const rough = generateTable(ROUGH_ANCHORS, 1, 600);
const sand = generateTable(SAND_ANCHORS, 1, 300);
const recovery = generateTable(RECOVERY_ANCHORS, 1, 500);
const green = generateTable(GREEN_ANCHORS, 1, 90);

// Output TypeScript
const output = `import { LieType } from "@/lib/types";

// PGA Tour expected strokes baseline data
// Source: Mark Broadie's "Every Shot Counts" + PGA Tour ShotLink
// Densified to 1-yard (shots) / 1-foot (putts) granularity via cubic spline interpolation

${formatTable('TEE_EXPECTED_STROKES', tee)}

${formatTable('FAIRWAY_EXPECTED_STROKES', fairway)}

${formatTable('ROUGH_EXPECTED_STROKES', rough)}

${formatTable('SAND_EXPECTED_STROKES', sand)}

${formatTable('RECOVERY_EXPECTED_STROKES', recovery)}

// Expected putts from GREEN by distance in FEET
${formatTable('GREEN_EXPECTED_PUTTS', green)}

const LIE_TABLE_MAP: Record<string, Record<number, number>> = {
  tee: TEE_EXPECTED_STROKES,
  fairway: FAIRWAY_EXPECTED_STROKES,
  rough: ROUGH_EXPECTED_STROKES,
  sand: SAND_EXPECTED_STROKES,
  green: GREEN_EXPECTED_PUTTS,
  recovery: RECOVERY_EXPECTED_STROKES,
};

export function getExpectedStrokes(lie: LieType, distance: number): number {
  const table = LIE_TABLE_MAP[lie] ?? FAIRWAY_EXPECTED_STROKES;
  const dist = Math.max(1, Math.round(distance));

  // Direct lookup (covers most cases with 1-unit granularity)
  if (table[dist] !== undefined) return table[dist];

  // Fallback: extrapolate beyond table max
  const distances = Object.keys(table).map(Number).sort((a, b) => a - b);
  const minDist = distances[0];
  const maxDist = distances[distances.length - 1];

  if (dist <= minDist) return table[minDist];
  if (dist >= maxDist) {
    // Extrapolate beyond table max: +0.005 strokes per unit beyond max
    return table[maxDist] + (dist - maxDist) * 0.005;
  }

  // Find surrounding entries and interpolate (shouldn't normally reach here)
  let lower = minDist;
  let upper = maxDist;
  for (let i = 0; i < distances.length - 1; i++) {
    if (distances[i] <= dist && distances[i + 1] >= dist) {
      lower = distances[i];
      upper = distances[i + 1];
      break;
    }
  }
  const ratio = (dist - lower) / (upper - lower);
  return table[lower] + ratio * (table[upper] - table[lower]);
}
`;

process.stdout.write(output);
