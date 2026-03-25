import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liveEvents } from "@/lib/db/schema";
import { generateJoinCode } from "@/lib/live/join-code";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { name, courseName, holePars } = await request.json();

    if (!name || !courseName || !Array.isArray(holePars) || holePars.length !== 18) {
      return NextResponse.json(
        { error: "name, courseName, and holePars (18 integers) are required" },
        { status: 400 }
      );
    }

    // Generate unique join code (retry on collision)
    let joinCode = generateJoinCode();
    for (let i = 0; i < 5; i++) {
      const [existing] = await db
        .select({ id: liveEvents.id })
        .from(liveEvents)
        .where(eq(liveEvents.joinCode, joinCode));
      if (!existing) break;
      joinCode = generateJoinCode();
    }

    const id = crypto.randomUUID();
    const organizerSecret = crypto.randomUUID();

    const event = {
      id,
      name,
      courseName,
      joinCode,
      organizerSecret,
      holePars,
      status: "lobby" as const,
      createdAt: new Date().toISOString(),
    };

    await db.insert(liveEvents).values(event);

    return NextResponse.json(
      {
        event: {
          id: event.id,
          name: event.name,
          courseName: event.courseName,
          joinCode: event.joinCode,
          holePars: event.holePars,
          status: event.status,
          createdAt: event.createdAt,
        },
        organizerSecret,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create live event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
