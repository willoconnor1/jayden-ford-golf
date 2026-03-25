import type { Round, Goal, HoleData, SavedCourse, CourseTeeData } from "@/lib/types";

// ── Round: DB row ↔ App type ──────────────────────────────────────

export function roundToRow(round: Round) {
  return {
    id: round.id,
    date: round.date,
    courseName: round.course.name,
    courseTees: round.course.tees,
    courseRating: round.course.rating,
    courseSlope: round.course.slope,
    courseTotalPar: round.course.totalPar,
    courseHolePars: round.course.holePars,
    courseHoleDistances: round.course.holeDistances,
    holes: round.holes as unknown as HoleData[],
    totalScore: round.totalScore,
    notes: round.notes,
    createdAt: round.createdAt,
    updatedAt: round.updatedAt,
  };
}

export function rowToRound(row: {
  id: string;
  date: string;
  courseName: string;
  courseTees: string;
  courseRating: number;
  courseSlope: number;
  courseTotalPar: number;
  courseHolePars: number[];
  courseHoleDistances: number[];
  holes: unknown;
  totalScore: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}): Round {
  return {
    id: row.id,
    date: row.date,
    course: {
      name: row.courseName,
      tees: row.courseTees,
      rating: row.courseRating,
      slope: row.courseSlope,
      totalPar: row.courseTotalPar,
      holePars: row.courseHolePars,
      holeDistances: row.courseHoleDistances,
    },
    holes: row.holes as HoleData[],
    totalScore: row.totalScore,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── Goal: DB row ↔ App type ───────────────────────────────────────

export function goalToRow(goal: Goal) {
  return {
    id: goal.id,
    statCategory: goal.statCategory,
    targetValue: goal.targetValue,
    startValue: goal.startValue,
    targetDate: goal.targetDate,
    direction: goal.direction,
    createdAt: goal.createdAt,
    isCompleted: goal.isCompleted,
    completedAt: goal.completedAt,
  };
}

export function rowToGoal(row: {
  id: string;
  statCategory: string;
  targetValue: number;
  startValue: number;
  targetDate: string;
  direction: string;
  createdAt: string;
  isCompleted: boolean;
  completedAt: string | null;
}): Goal {
  return {
    id: row.id,
    statCategory: row.statCategory as Goal["statCategory"],
    targetValue: row.targetValue,
    startValue: row.startValue,
    targetDate: row.targetDate,
    direction: row.direction as Goal["direction"],
    createdAt: row.createdAt,
    isCompleted: row.isCompleted,
    completedAt: row.completedAt,
  };
}

// ── Course: DB row ↔ App type ─────────────────────────────────────

export function courseToRow(course: SavedCourse) {
  return {
    id: course.id,
    externalId: course.externalId ?? null,
    apiSource: course.apiSource ?? null,
    name: course.name,
    clubName: course.clubName ?? null,
    city: course.city ?? null,
    state: course.state ?? null,
    country: course.country ?? null,
    latitude: course.latitude ?? null,
    longitude: course.longitude ?? null,
    numberOfHoles: course.numberOfHoles,
    tees: course.tees,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    lastFetchedAt: course.lastFetchedAt ?? null,
    isFavorite: course.isFavorite,
  };
}

export function rowToCourse(row: {
  id: string;
  externalId: string | null;
  apiSource: string | null;
  name: string;
  clubName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  numberOfHoles: number | null;
  tees: CourseTeeData[];
  createdAt: string;
  updatedAt: string;
  lastFetchedAt: string | null;
  isFavorite: boolean | null;
}): SavedCourse {
  return {
    id: row.id,
    externalId: row.externalId ?? undefined,
    apiSource: row.apiSource ?? undefined,
    name: row.name,
    clubName: row.clubName ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    country: row.country ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    numberOfHoles: row.numberOfHoles ?? 18,
    tees: row.tees,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastFetchedAt: row.lastFetchedAt ?? undefined,
    isFavorite: row.isFavorite ?? false,
  };
}
