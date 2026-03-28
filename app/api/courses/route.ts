import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { courseToRow, rowToCourse } from "@/lib/db/helpers";
import type { SavedCourse } from "@/lib/types";

export async function GET() {
  try {
    const rows = await db.select().from(courses);
    return NextResponse.json(rows.map(rowToCourse));
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const course: SavedCourse = await request.json();
    const row = courseToRow(course);

    // Upsert: insert or update if course already exists (e.g. tee data added)
    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, course.id))
      .limit(1);

    if (existing.length > 0) {
      await db.update(courses).set(row).where(eq(courses.id, course.id));
    } else {
      await db.insert(courses).values(row);
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Failed to save course:", error);
    return NextResponse.json(
      { error: "Failed to save course" },
      { status: 500 }
    );
  }
}
