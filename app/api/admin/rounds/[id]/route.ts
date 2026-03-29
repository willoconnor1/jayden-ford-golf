import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rounds, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rowToRound, roundToRow } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import type { Round } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminEmail(authUser.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const [row] = await db
      .select()
      .from(rounds)
      .where(eq(rounds.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const [user] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, row.userId))
      .limit(1);

    return NextResponse.json({
      round: {
        ...rowToRound(row),
        userId: row.userId,
        userName: user?.name ?? "Unknown",
        userEmail: user?.email ?? "",
      },
    });
  } catch (error) {
    console.error("Admin round fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch round" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/rounds/[id] — edit any user's round
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminEmail(authUser.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Look up existing round to get userId
    const [existing] = await db
      .select({ userId: rounds.userId })
      .from(rounds)
      .where(eq(rounds.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const round: Round = await request.json();
    const row = roundToRow(round, existing.userId);
    row.updatedAt = new Date().toISOString();

    await db.update(rounds).set(row).where(eq(rounds.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin round update failed:", error);
    return NextResponse.json({ error: "Failed to update round" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/rounds/[id] — delete any round
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminEmail(authUser.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await db.delete(rounds).where(eq(rounds.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin round delete failed:", error);
    return NextResponse.json({ error: "Failed to delete round" }, { status: 500 });
  }
}
