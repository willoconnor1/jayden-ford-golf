import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { liveEvents, livePlayers } from "@/lib/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { name } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    // Verify event exists and is in lobby
    const [event] = await db
      .select({ id: liveEvents.id, status: liveEvents.status })
      .from(liveEvents)
      .where(eq(liveEvents.id, eventId));

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "lobby") {
      return NextResponse.json(
        { error: "Event has already started" },
        { status: 400 }
      );
    }

    const player = {
      id: crypto.randomUUID(),
      eventId,
      name: name.trim(),
      groupNumber: null,
      createdAt: new Date().toISOString(),
    };

    await db.insert(livePlayers).values(player);

    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    console.error("Failed to join event:", error);
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    );
  }
}
