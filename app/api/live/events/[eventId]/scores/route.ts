import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { liveEvents, liveScores } from "@/lib/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { scores } = await request.json();

    if (!Array.isArray(scores) || scores.length === 0) {
      return NextResponse.json(
        { error: "scores array is required" },
        { status: 400 }
      );
    }

    // Verify event exists and is active
    const [event] = await db
      .select({ id: liveEvents.id, status: liveEvents.status })
      .from(liveEvents)
      .where(eq(liveEvents.id, eventId));

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "active") {
      return NextResponse.json(
        { error: "Event is not active" },
        { status: 400 }
      );
    }

    // Upsert each score
    for (const { playerId, holeNumber, strokes } of scores) {
      const [existing] = await db
        .select({ id: liveScores.id })
        .from(liveScores)
        .where(
          and(
            eq(liveScores.eventId, eventId),
            eq(liveScores.playerId, playerId),
            eq(liveScores.holeNumber, holeNumber)
          )
        );

      if (existing) {
        await db
          .update(liveScores)
          .set({ strokes })
          .where(eq(liveScores.id, existing.id));
      } else {
        await db.insert(liveScores).values({
          id: crypto.randomUUID(),
          eventId,
          playerId,
          holeNumber,
          strokes,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit scores:", error);
    return NextResponse.json(
      { error: "Failed to submit scores" },
      { status: 500 }
    );
  }
}
