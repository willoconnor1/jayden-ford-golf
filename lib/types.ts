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
  firstPuttDistance: number; // feet
  penaltyStrokes: number;
  upAndDownAttempt: boolean;
  upAndDownConverted: boolean;
  sandSaveAttempt: boolean;
  sandSaveConverted: boolean;
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
