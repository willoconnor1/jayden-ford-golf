export type LieType = "tee" | "fairway" | "rough" | "sand" | "green" | "recovery";
export type FairwayHit = "yes" | "no" | "na";

export interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  fairwayHit: FairwayHit;
  greenInRegulation: boolean;
  putts: number;
  puttDistances: number[]; // distance in feet for each putt (index 0 = 1st putt)
  puttMisses?: Array<{
    missX: number;
    missY: number;
    missDirection?: PuttMissDirection;
    speed?: PuttSpeed;
    puttBreak?: PuttBreak;
  }>;
  penaltyStrokes: number;
  upAndDownAttempt: boolean;
  upAndDownConverted: boolean;
  sandSaveAttempt: boolean;
  sandSaveConverted: boolean;
  shots?: ShotData[];
}

export interface CourseInfo {
  name: string;
  tees: string;
  rating: number;
  slope: number;
  totalPar: number;
  holePars: number[];
  holeDistances: number[];
}

export interface Round {
  id: string;
  date: string;
  course: CourseInfo;
  holes: HoleData[];
  totalScore: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoundStats {
  roundId: string;
  totalScore: number;
  scoreToPar: number;
  fairwaysHit: number;
  fairwaysAttempted: number;
  fairwayPercentage: number;
  greensInRegulation: number;
  girPercentage: number;
  totalPutts: number;
  puttsPerGir: number;
  upAndDownAttempts: number;
  upAndDownConversions: number;
  upAndDownPercentage: number;
  sandSaveAttempts: number;
  sandSaveConversions: number;
  sandSavePercentage: number;
  scramblingPercentage: number;
  penalties: number;
}

export interface AggregateStats {
  roundCount: number;
  scoringAverage: number;
  fairwayPercentage: number;
  girPercentage: number;
  puttsPerRound: number;
  puttsPerGir: number;
  upAndDownPercentage: number;
  sandSavePercentage: number;
  scramblingPercentage: number;
  averagePenalties: number;
}

export interface StrokesGainedResult {
  sgOffTheTee: number;
  sgApproach: number;
  sgAroundTheGreen: number;
  sgPutting: number;
  sgTotal: number;
}

export type StatCategory =
  | "scoringAverage"
  | "fairwayPercentage"
  | "girPercentage"
  | "puttsPerRound"
  | "puttsPerGir"
  | "upAndDownPercentage"
  | "sandSavePercentage"
  | "scramblingPercentage"
  | "sgOffTheTee"
  | "sgApproach"
  | "sgAroundTheGreen"
  | "sgPutting"
  | "sgTotal";

export interface Goal {
  id: string;
  statCategory: StatCategory;
  targetValue: number;
  startValue: number;
  targetDate: string;
  direction: "increase" | "decrease";
  createdAt: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface Drill {
  id: string;
  name: string;
  category: "driving" | "approach" | "shortGame" | "putting";
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  targetStat: string;
}

// ── Putt Metadata ───────────────────────────────────────────────

export type PuttMissDirection = "left" | "right";
export type PuttSpeed = "too-firm" | "too-soft";
export type PuttBreak = "straight" | "right-to-left" | "left-to-right" | "multiple";

// ── Shot Dispersion ──────────────────────────────────────────────

export type ShotLie = "tee" | "fairway" | "rough" | "sand" | "penalty-area" | "abnormal";

export type ShotResult = "fairway" | "rough" | "penalty-area" | "out-of-bounds" | "tree-trouble" | "abnormal";

export type AbnormalLieDetail =
  | "pine-straw"
  | "deep-rough"
  | "in-trees"
  | "divot"
  | "hardpan"
  | "uphill"
  | "downhill"
  | "sidehill"
  | "other";

export type Club =
  | "driver" | "3-wood" | "5-wood" | "7-wood"
  | "2-hybrid" | "3-hybrid" | "4-hybrid" | "5-hybrid"
  | "2-iron" | "3-iron" | "4-iron" | "5-iron" | "6-iron"
  | "7-iron" | "8-iron" | "9-iron"
  | "pw" | "gw" | "sw" | "lw";

export interface ShotData {
  club: Club;
  targetDistance: number;          // yards — intended distance
  lie: ShotLie;
  abnormalDetail?: AbnormalLieDetail;
  missX: number;                   // feet — negative = left, positive = right
  missY: number;                   // feet — negative = short, positive = long
  result?: ShotResult;             // where ball ended up (driver/tee shots)
  penaltyDrop?: boolean;           // took a penalty drop
}

export interface PracticeFocus {
  category: "driving" | "approach" | "shortGame" | "putting";
  sgCategory: keyof StrokesGainedResult;
  sgValue: number;
  severity: "critical" | "moderate" | "minor";
  description: string;
  recommendation: string;
  suggestedDrills: Drill[];
  practiceTimeAllocation: number;
}
