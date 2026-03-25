import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { courseToRow, rowToCourse } from "@/lib/db/helpers";
import { getCourseDetail, apiCourseToSavedCourse } from "@/lib/golf-course-api";
import { eq } from "drizzle-orm";
import type { SavedCourse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Check if we have this course cached (by externalId or id)
    let cached: SavedCourse | null = null;
    try {
      const rows = await db
        .select()
        .from(courses)
        .where(eq(courses.externalId, id))
        .limit(1);
      if (rows.length > 0) {
        cached = rowToCourse(rows[0]);
      }

      // Also try by local id
      if (!cached) {
        const rows2 = await db
          .select()
          .from(courses)
          .where(eq(courses.id, id))
          .limit(1);
        if (rows2.length > 0) {
          cached = rowToCourse(rows2[0]);
        }
      }
    } catch {
      // DB not available
    }

    // If cached and has tee data, return it
    if (cached && cached.tees.length > 0) {
      return NextResponse.json(cached);
    }

    // 2. Fetch full detail from external API
    const apiKey = process.env.GOLF_COURSE_API_KEY;
    if (!apiKey) {
      if (cached) return NextResponse.json(cached);
      return NextResponse.json(
        { error: "Course not found and API key not configured" },
        { status: 404 }
      );
    }

    const detail = await getCourseDetail(id);
    const now = new Date().toISOString();
    const course: SavedCourse = {
      ...apiCourseToSavedCourse(detail),
      // Preserve local id if we had a cached entry
      id: cached?.id ?? crypto.randomUUID(),
      createdAt: cached?.createdAt ?? now,
      updatedAt: now,
    };

    // 3. Cache in DB
    try {
      await db
        .insert(courses)
        .values(courseToRow(course))
        .onConflictDoNothing({ target: courses.id });
    } catch {
      // DB write failed — still return the course
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Course detail fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch course detail" },
      { status: 500 }
    );
  }
}
