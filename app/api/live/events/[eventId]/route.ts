import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { liveEvents, livePlayers, liveScores } from "@/lib/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

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
      .where(eq(liveEvents.id, eventId));

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const players = await db
      .select()
      .from(livePlayers)
      .where(eq(livePlayers.eventId, eventId));

    const scores = await db
      .select()
      .from(liveScores)
      .where(eq(liveScores.eventId, eventId));

    return NextResponse.json({ event, players, scores });
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { organizerSecret, status, playerGroups } = await request.json();

    // Verify organizer
    const [event] = await db
      .select()
      .from(liveEvents)
      .where(eq(liveEvents.id, eventId));

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.organizerSecret !== organizerSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update event status
    if (status) {
      await db
        .update(liveEvents)
        .set({ status })
        .where(eq(liveEvents.id, eventId));
    }

    // Update player group assignments
    if (Array.isArray(playerGroups)) {
      for (const { playerId, groupNumber } of playerGroups) {
        await db
          .update(livePlayers)
          .set({ groupNumber })
          .where(eq(livePlayers.id, playerId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
