import { Club, ShotLie, AbnormalLieDetail } from "./types";

export const CLUBS: { value: Club; label: string }[] = [
  { value: "driver", label: "Driver" },
  { value: "3-wood", label: "3 Wood" },
  { value: "5-wood", label: "5 Wood" },
  { value: "7-wood", label: "7 Wood" },
  { value: "2-hybrid", label: "2 Hybrid" },
  { value: "3-hybrid", label: "3 Hybrid" },
  { value: "4-hybrid", label: "4 Hybrid" },
  { value: "5-hybrid", label: "5 Hybrid" },
  { value: "2-iron", label: "2 Iron" },
  { value: "3-iron", label: "3 Iron" },
  { value: "4-iron", label: "4 Iron" },
  { value: "5-iron", label: "5 Iron" },
  { value: "6-iron", label: "6 Iron" },
  { value: "7-iron", label: "7 Iron" },
  { value: "8-iron", label: "8 Iron" },
  { value: "9-iron", label: "9 Iron" },
  { value: "pw", label: "PW" },
  { value: "gw", label: "GW" },
  { value: "sw", label: "SW" },
  { value: "lw", label: "LW" },
];

export const SHOT_LIES: { value: ShotLie; label: string }[] = [
  { value: "fairway", label: "Fairway" },
  { value: "rough", label: "Rough" },
  { value: "sand", label: "Sand" },
  { value: "penalty-area", label: "Penalty Area" },
  { value: "abnormal", label: "Abnormal Lie" },
];

export const ABNORMAL_DETAILS: { value: AbnormalLieDetail; label: string }[] = [
  { value: "pine-straw", label: "Pine Straw" },
  { value: "deep-rough", label: "Deep Rough" },
  { value: "in-trees", label: "In Trees" },
  { value: "divot", label: "Divot" },
  { value: "hardpan", label: "Hardpan" },
  { value: "uphill", label: "Uphill Lie" },
  { value: "downhill", label: "Downhill Lie" },
  { value: "sidehill", label: "Sidehill Lie" },
  { value: "other", label: "Other" },
];
