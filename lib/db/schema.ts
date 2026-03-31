import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// ── Users ─────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  birthdate: text("birthdate"),
  handicap: real("handicap"),
  homeClub: text("home_club"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  isCollegePlayer: boolean("is_college_player").default(false),
  collegeName: text("college_name"),
  isTourPlayer: boolean("is_tour_player").default(false),
  tourName: text("tour_name"),
  distanceUnit: text("distance_unit").notNull().default("yards"),
  benchmarkLevel: text("benchmark_level").notNull().default("pga-tour"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── Rounds ────────────────────────────────────────────────────────
export const rounds = pgTable("rounds", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),

  // Course info (flattened for queryability)
  courseName: text("course_name").notNull(),
  courseTees: text("course_tees").notNull(),
  courseRating: real("course_rating").notNull(),
  courseSlope: integer("course_slope").notNull(),
  courseTotalPar: integer("course_total_par").notNull(),
  courseHolePars: jsonb("course_hole_pars").$type<number[]>().notNull(),
  courseHoleDistances: jsonb("course_hole_distances").$type<number[]>().notNull(),

  // Holes stored as JSONB (complex nested structure)
  holes: jsonb("holes").notNull(),

  totalScore: integer("total_score").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── Courses (API cache + saved) ───────────────────────────────────
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  externalId: text("external_id"),
  apiSource: text("api_source"),

  name: text("name").notNull(),
  clubName: text("club_name"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  numberOfHoles: integer("number_of_holes").default(18),

  tees: jsonb("tees").$type<import("@/lib/types").CourseTeeData[]>().notNull(),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastFetchedAt: text("last_fetched_at"),
  isFavorite: boolean("is_favorite").default(false),
});

// ── Goals ─────────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  statCategory: text("stat_category").notNull(),
  targetValue: real("target_value").notNull(),
  startValue: real("start_value").notNull(),
  targetDate: text("target_date").notNull(),
  direction: text("direction").notNull(), // "increase" | "decrease"
  createdAt: text("created_at").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: text("completed_at"),
});

// ── Live Events ──────────────────────────────────────────────────
export const liveEvents = pgTable("live_events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  courseName: text("course_name").notNull(),
  joinCode: text("join_code").notNull().unique(),
  organizerSecret: text("organizer_secret").notNull(),
  holePars: jsonb("hole_pars").$type<number[]>().notNull(),
  status: text("status").notNull().default("lobby"), // "lobby" | "active" | "completed"
  createdAt: text("created_at").notNull(),
});

// ── Live Players ─────────────────────────────────────────────────
export const livePlayers = pgTable("live_players", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  name: text("name").notNull(),
  groupNumber: integer("group_number"),
  createdAt: text("created_at").notNull(),
});

// ── Live Scores ──────────────────────────────────────────────────
export const liveScores = pgTable("live_scores", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  playerId: text("player_id").notNull(),
  holeNumber: integer("hole_number").notNull(),
  strokes: integer("strokes").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  unique("live_scores_player_hole").on(table.eventId, table.playerId, table.holeNumber),
]);
