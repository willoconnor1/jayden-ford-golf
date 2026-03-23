import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// ── Rounds ────────────────────────────────────────────────────────
export const rounds = pgTable("rounds", {
  id: text("id").primaryKey(),
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

// ── Goals ─────────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  statCategory: text("stat_category").notNull(),
  targetValue: real("target_value").notNull(),
  startValue: real("start_value").notNull(),
  targetDate: text("target_date").notNull(),
  direction: text("direction").notNull(), // "increase" | "decrease"
  createdAt: text("created_at").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: text("completed_at"),
});
