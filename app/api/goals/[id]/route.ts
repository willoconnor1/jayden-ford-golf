import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { goalToRow, rowToGoal } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";
import type { Goal } from "@/lib/types";

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
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, user.userId)));
    if (!row) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(rowToGoal(row));
  } catch (error) {
    console.error("Failed to fetch goal:", error);
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 });
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
    const goal: Goal = await request.json();
    const row = goalToRow(goal, user.userId);
    await db
      .update(goals)
      .set(row)
      .where(and(eq(goals.id, id), eq(goals.userId, user.userId)));
    return NextResponse.json(goal);
  } catch (error) {
    console.error("Failed to update goal:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
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
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, user.userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
