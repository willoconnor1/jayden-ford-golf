import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { courseToRow, rowToCourse } from "@/lib/db/helpers";
import { searchCourses, apiCourseToSavedCourse } from "@/lib/golf-course-api";
import { ilike } from "drizzle-orm";
import type { SavedCourse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const country = request.nextUrl.searchParams.get("country") ?? undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20");

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    // 1. Check local DB cache first
    let cached: SavedCourse[] = [];
    try {
      const rows = await db
        .select()
        .from(courses)
        .where(ilike(courses.name, `%${q}%`))
        .limit(limit);
      cached = rows.map(rowToCourse);
    } catch {
      // DB not available — skip cache
    }

    // 2. If we have enough cached results, return them
    if (cached.length >= limit) {
      return NextResponse.json({ courses: cached, source: "cache" });
    }

    // 3. Call external API for more results
    const apiKey = process.env.GOLF_COURSE_API_KEY;
    if (!apiKey) {
      // No API key — return cached results only
      return NextResponse.json({ courses: cached, source: "cache" });
    }

    const apiResults = await searchCourses(q, { country, limit });
    const now = new Date().toISOString();

    const apiCourses: SavedCourse[] = apiResults.map((r) => ({
      ...apiCourseToSavedCourse(r),
      createdAt: now,
      updatedAt: now,
    }));

    // 4. Deduplicate: prefer cached (which may have been favorited) over API results
    const cachedExtIds = new Set(cached.map((c) => c.externalId).filter(Boolean));
    const deduped = apiCourses.filter((c) => !cachedExtIds.has(c.externalId));

    const combined = [...cached, ...deduped].slice(0, limit);

    // 5. Cache new API results in DB (background, don't block response)
    if (deduped.length > 0) {
      Promise.resolve().then(async () => {
        for (const course of deduped) {
          try {
            await db
              .insert(courses)
              .values(courseToRow(course))
              .onConflictDoNothing({ target: courses.id });
          } catch {
            // Ignore individual insert failures
          }
        }
      });
    }

    return NextResponse.json({ courses: combined, source: "mixed" });
  } catch (error) {
    console.error("Course search failed:", error);
    return NextResponse.json(
      { error: "Course search failed" },
      { status: 500 }
    );
  }
}
