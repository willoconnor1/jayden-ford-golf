import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { rounds } from "@/lib/db/schema";
import { roundToRow, rowToRound } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";
import type { Round } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const [row] = await db
      .select()
      .from(rounds)
      .where(and(eq(rounds.id, id), eq(rounds.userId, user.userId)));
    if (!row) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }
    return NextResponse.json(rowToRound(row));
  } catch (error) {
    console.error("Failed to fetch round:", error);
    return NextResponse.json({ error: "Failed to fetch round" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const round: Round = await request.json();
    const row = roundToRow(round, user.userId);
    await db
      .update(rounds)
      .set(row)
      .where(and(eq(rounds.id, id), eq(rounds.userId, user.userId)));
    return NextResponse.json(round);
  } catch (error) {
    console.error("Failed to update round:", error);
    return NextResponse.json({ error: "Failed to update round" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await db
      .delete(rounds)
      .where(and(eq(rounds.id, id), eq(rounds.userId, user.userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete round:", error);
    return NextResponse.json({ error: "Failed to delete round" }, { status: 500 });
  }
}
