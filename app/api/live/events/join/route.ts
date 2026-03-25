import { NextResponse } from "next/server";
import { eq, ne, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { liveEvents } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const [event] = await db
      .select({
        id: liveEvents.id,
        name: liveEvents.name,
        courseName: liveEvents.courseName,
        joinCode: liveEvents.joinCode,
        holePars: liveEvents.holePars,
        status: liveEvents.status,
        createdAt: liveEvents.createdAt,
      })
      .from(liveEvents)
      .where(
        and(
          eq(liveEvents.joinCode, code),
          ne(liveEvents.status, "completed")
        )
      );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to lookup event:", error);
    return NextResponse.json(
      { error: "Failed to lookup event" },
      { status: 500 }
    );
  }
}
