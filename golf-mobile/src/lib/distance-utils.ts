export type DistanceUnit = "yards" | "meters";

const YARDS_TO_METERS = 0.9144;
const FEET_TO_METERS = 0.3048;

/** Convert a stored yards value to display value */
export function displayYards(yards: number, unit: DistanceUnit): number {
  if (unit === "meters") return Math.round(yards * YARDS_TO_METERS);
  return yards;
}

/** Convert a stored feet value to display value */
export function displayFeet(feet: number, unit: DistanceUnit): number {
  if (unit === "meters") return Math.round(feet * FEET_TO_METERS * 10) / 10;
  return feet;
}

/** Convert user input back to yards for storage */
export function inputToYards(value: number, unit: DistanceUnit): number {
  if (unit === "meters") return Math.round(value / YARDS_TO_METERS);
  return value;
}

/** Convert user input back to feet for storage */
export function inputToFeet(value: number, unit: DistanceUnit): number {
  if (unit === "meters") return Math.round(value / FEET_TO_METERS * 10) / 10;
  return value;
}

/** Label for yards distances: "yds" or "m" */
export function yardsLabel(unit: DistanceUnit): string {
  return unit === "meters" ? "m" : "yds";
}

/** Short label for yards distances: "y" or "m" */
export function yardsLabelShort(unit: DistanceUnit): string {
  return unit === "meters" ? "m" : "y";
}

/** Label for feet distances: "ft" or "m" */
export function feetLabel(unit: DistanceUnit): string {
  return unit === "meters" ? "m" : "ft";
}
