import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rounds, goals, courses } from "@/lib/db/schema";
import {
  roundToRow,
  rowToRound,
  goalToRow,
  rowToGoal,
  courseToRow,
  rowToCourse,
} from "@/lib/db/helpers";
import type { Round, Goal, SavedCourse } from "@/lib/types";
import { eq } from "drizzle-orm";

/**
 * GET /api/sync — pull all data from the database
 */
export async function GET() {
  try {
    const [dbRounds, dbGoals, dbCourses] = await Promise.all([
      db.select().from(rounds),
      db.select().from(goals),
      db.select().from(courses),
    ]);
    return NextResponse.json({
      rounds: dbRounds.map(rowToRound),
      goals: dbGoals.map(rowToGoal),
      courses: dbCourses.map(rowToCourse),
    });
  } catch (error) {
    console.error("Sync pull failed:", error);
    return NextResponse.json({ error: "Sync pull failed" }, { status: 500 });
  }
}

/**
 * POST /api/sync — upsert local-only items into the database
 *
 * Body: { rounds: Round[], goals: Goal[], courses?: SavedCourse[] }
 *
 * Multi-user safe: only inserts/updates, NEVER deletes.
 * Items already in DB are updated; new items are inserted.
 */
export async function POST(request: Request) {
  try {
    const body: { rounds: Round[]; goals: Goal[]; courses?: SavedCourse[] } =
      await request.json();

    // ── Upsert rounds ────────────────────────────────────────
    const dbRounds = await db.select({ id: rounds.id }).from(rounds);
    const dbRoundIds = new Set(dbRounds.map((r) => r.id));

    for (const round of body.rounds) {
      const row = roundToRow(round);
      if (dbRoundIds.has(round.id)) {
        await db.update(rounds).set(row).where(eq(rounds.id, round.id));
      } else {
        await db.insert(rounds).values(row);
      }
    }

    // ── Upsert goals ─────────────────────────────────────────
    const dbGoals = await db.select({ id: goals.id }).from(goals);
    const dbGoalIds = new Set(dbGoals.map((g) => g.id));

    for (const goal of body.goals) {
      const row = goalToRow(goal);
      if (dbGoalIds.has(goal.id)) {
        await db.update(goals).set(row).where(eq(goals.id, goal.id));
      } else {
        await db.insert(goals).values(row);
      }
    }

    // ── Upsert courses ───────────────────────────────────────
    if (body.courses?.length) {
      const dbCourses = await db.select({ id: courses.id }).from(courses);
      const dbCourseIds = new Set(dbCourses.map((c) => c.id));

      for (const course of body.courses) {
        const row = courseToRow(course);
        if (dbCourseIds.has(course.id)) {
          await db.update(courses).set(row).where(eq(courses.id, course.id));
        } else {
          await db.insert(courses).values(row);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync push failed:", error);
    return NextResponse.json({ error: "Sync push failed" }, { status: 500 });
  }
}
