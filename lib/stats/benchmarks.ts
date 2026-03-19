import { LieType } from "@/lib/types";

// PGA Tour expected strokes baseline data
// Source: Mark Broadie's "Every Shot Counts" + PGA Tour ShotLink

export const TEE_EXPECTED_STROKES: Record<number, number> = {
  100: 2.92, 150: 2.99, 200: 3.12, 250: 3.45, 300: 3.71,
  350: 3.86, 400: 3.99, 420: 4.08, 440: 4.12, 460: 4.17,
  480: 4.28, 500: 4.41, 520: 4.54, 540: 4.65, 560: 4.74,
  580: 4.82, 600: 4.89,
};

export const FAIRWAY_EXPECTED_STROKES: Record<number, number> = {
  20: 2.40, 30: 2.43, 40: 2.50, 50: 2.54, 60: 2.58,
  70: 2.62, 80: 2.68, 90: 2.72, 100: 2.80, 110: 2.82,
  120: 2.85, 130: 2.88, 140: 2.91, 150: 2.95, 160: 2.98,
  170: 3.03, 180: 3.08, 190: 3.13, 200: 3.19, 210: 3.25,
  220: 3.32, 230: 3.40, 240: 3.50, 250: 3.62, 260: 3.70,
  280: 3.78, 300: 3.78,
};

export const ROUGH_EXPECTED_STROKES: Record<number, number> = {
  10: 2.34, 20: 2.57, 30: 2.69, 40: 2.74, 50: 2.78,
  60: 2.82, 70: 2.87, 80: 2.96, 90: 2.99, 100: 3.02,
  110: 3.05, 120: 3.08, 130: 3.12, 140: 3.17, 150: 3.22,
  160: 3.28, 170: 3.31, 180: 3.37, 190: 3.40, 200: 3.42,
  220: 3.55, 240: 3.65, 260: 3.78, 280: 3.90, 300: 3.90,
};

export const SAND_EXPECTED_STROKES: Record<number, number> = {
  10: 2.47, 20: 2.53, 30: 2.65, 40: 2.79, 50: 2.90,
  60: 3.00, 70: 3.10, 80: 3.24, 90: 3.21, 100: 3.23,
  120: 3.21, 140: 3.30, 160: 3.40, 180: 3.50, 200: 3.55,
  250: 3.80, 300: 4.04,
};

export const RECOVERY_EXPECTED_STROKES: Record<number, number> = {
  100: 3.80, 150: 3.78, 200: 3.87, 250: 4.00,
  300: 4.20, 350: 4.40, 400: 4.75, 500: 5.17,
};

// Expected putts from GREEN by distance in FEET
export const GREEN_EXPECTED_PUTTS: Record<number, number> = {
  1: 1.001, 2: 1.009, 3: 1.053, 4: 1.147, 5: 1.256,
  6: 1.357, 7: 1.443, 8: 1.500, 9: 1.556, 10: 1.626,
  12: 1.700, 15: 1.790, 18: 1.840, 20: 1.878, 25: 1.934,
  30: 1.978, 35: 2.020, 40: 2.055, 45: 2.095, 50: 2.135,
  55: 2.175, 60: 2.218, 70: 2.290, 80: 2.350, 90: 2.400,
};

export function interpolateExpectedStrokes(
  table: Record<number, number>,
  distance: number
): number {
  const distances = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);

  if (distance <= distances[0]) return table[distances[0]];
  if (distance >= distances[distances.length - 1])
    return table[distances[distances.length - 1]];

  let lower = distances[0];
  let upper = distances[distances.length - 1];
  for (let i = 0; i < distances.length - 1; i++) {
    if (distances[i] <= distance && distances[i + 1] >= distance) {
      lower = distances[i];
      upper = distances[i + 1];
      break;
    }
  }

  const ratio = (distance - lower) / (upper - lower);
  return table[lower] + ratio * (table[upper] - table[lower]);
}

export function getExpectedStrokes(lie: LieType, distance: number): number {
  switch (lie) {
    case "tee":
      return interpolateExpectedStrokes(TEE_EXPECTED_STROKES, distance);
    case "fairway":
      return interpolateExpectedStrokes(FAIRWAY_EXPECTED_STROKES, distance);
    case "rough":
      return interpolateExpectedStrokes(ROUGH_EXPECTED_STROKES, distance);
    case "sand":
      return interpolateExpectedStrokes(SAND_EXPECTED_STROKES, distance);
    case "green":
      return interpolateExpectedStrokes(GREEN_EXPECTED_PUTTS, distance);
    case "recovery":
      return interpolateExpectedStrokes(RECOVERY_EXPECTED_STROKES, distance);
    default:
      return interpolateExpectedStrokes(FAIRWAY_EXPECTED_STROKES, distance);
  }
}
