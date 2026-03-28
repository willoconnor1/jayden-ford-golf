import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
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
import { getAuthUser } from "@/lib/auth";
import type { Round, Goal, SavedCourse } from "@/lib/types";

/**
 * GET /api/sync — pull all data from the database (scoped to current user)
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [dbRounds, dbGoals, dbCourses] = await Promise.all([
      db.select().from(rounds).where(eq(rounds.userId, user.userId)),
      db.select().from(goals).where(eq(goals.userId, user.userId)),
      db.select().from(courses), // courses are shared
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
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: { rounds: Round[]; goals: Goal[]; courses?: SavedCourse[] } =
      await request.json();

    // ── Upsert rounds (scoped to user) ─────────────────────
    const dbRounds = await db
      .select({ id: rounds.id })
      .from(rounds)
      .where(eq(rounds.userId, user.userId));
    const dbRoundIds = new Set(dbRounds.map((r) => r.id));

    for (const round of body.rounds) {
      const row = roundToRow(round, user.userId);
      if (dbRoundIds.has(round.id)) {
        await db.update(rounds).set(row).where(and(eq(rounds.id, round.id), eq(rounds.userId, user.userId)));
      } else {
        await db.insert(rounds).values(row);
      }
    }

    // ── Upsert goals (scoped to user) ──────────────────────
    const dbGoals = await db
      .select({ id: goals.id })
      .from(goals)
      .where(eq(goals.userId, user.userId));
    const dbGoalIds = new Set(dbGoals.map((g) => g.id));

    for (const goal of body.goals) {
      const row = goalToRow(goal, user.userId);
      if (dbGoalIds.has(goal.id)) {
        await db.update(goals).set(row).where(and(eq(goals.id, goal.id), eq(goals.userId, user.userId)));
      } else {
        await db.insert(goals).values(row);
      }
    }

    // ── Upsert courses (shared, no user scoping) ───────────
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
