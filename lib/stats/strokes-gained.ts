import { HoleData, Round, StrokesGainedResult } from "@/lib/types";
import { getExpectedStrokes } from "./benchmarks";

function estimateDriveDistance(hole: HoleData): number {
  if (hole.par === 4) return Math.min(hole.distance * 0.65, 310);
  if (hole.par === 5) return Math.min(hole.distance * 0.52, 310);
  return 0;
}

function estimateApproachDistance(hole: HoleData): number {
  if (hole.par === 3) return hole.distance;
  if (hole.par === 4) return hole.distance - estimateDriveDistance(hole);
  if (hole.par === 5)
    return Math.max(hole.distance - estimateDriveDistance(hole) - 200, 50);
  return 150;
}

export function calculateHoleStrokesGained(
  hole: HoleData
): StrokesGainedResult {
  // SG: Putting — most accurate since we have first putt distance
  const firstPuttDist = hole.puttDistances?.[0] ?? 0;
  const expectedPutts = getExpectedStrokes("green", firstPuttDist);
  const sgPutting = expectedPutts - hole.putts;

  // Expected strokes from tee
  const expectedFromTee = getExpectedStrokes("tee", hole.distance);

  // SG: Total for this hole
  const sgTotal = expectedFromTee - hole.score;

  // SG: Off-the-Tee (par 4+ only)
  let sgOffTheTee = 0;
  if (hole.par >= 4) {
    const driveDistance = estimateDriveDistance(hole);
    const remainingDistance = hole.distance - driveDistance;
    const approachLie = hole.fairwayHit === "yes" ? "fairway" : "rough";
    const expectedAfterDrive = getExpectedStrokes(
      approachLie,
      Math.max(remainingDistance, 10)
    );
    sgOffTheTee = expectedFromTee - 1 - expectedAfterDrive;
  }

  // SG: Approach
  let sgApproach = 0;
  if (hole.greenInRegulation) {
    const approachStartDistance = estimateApproachDistance(hole);
    const approachLie =
      hole.par === 3
        ? "tee"
        : hole.fairwayHit === "yes"
          ? "fairway"
          : "rough";
    const expectedBeforeApproach =
      hole.par === 3
        ? expectedFromTee
        : getExpectedStrokes(approachLie, approachStartDistance);
    const expectedAfterApproach = getExpectedStrokes(
      "green",
      hole.puttDistances?.[0] ?? 0
    );
    sgApproach = expectedBeforeApproach - 1 - expectedAfterApproach;
  }

  // SG: Around the Green = residual
  const sgAroundTheGreen = sgTotal - sgOffTheTee - sgApproach - sgPutting;

  return { sgOffTheTee, sgApproach, sgAroundTheGreen, sgPutting, sgTotal };
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

export function calculateRoundStrokesGained(
  round: Round
): StrokesGainedResult {
  const holeSGs = round.holes.map(calculateHoleStrokesGained);
  return {
    sgOffTheTee: sum(holeSGs.map((h) => h.sgOffTheTee)),
    sgApproach: sum(holeSGs.map((h) => h.sgApproach)),
    sgAroundTheGreen: sum(holeSGs.map((h) => h.sgAroundTheGreen)),
    sgPutting: sum(holeSGs.map((h) => h.sgPutting)),
    sgTotal: sum(holeSGs.map((h) => h.sgTotal)),
  };
}
