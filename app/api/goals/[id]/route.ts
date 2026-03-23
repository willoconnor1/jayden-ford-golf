import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { goalToRow, rowToGoal } from "@/lib/db/helpers";
import type { Goal } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(goals).where(eq(goals.id, id));
    if (!row) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(rowToGoal(row));
  } catch (error) {
    console.error("Failed to fetch goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goal: Goal = await request.json();
    const row = goalToRow(goal);
    await db.update(goals).set(row).where(eq(goals.id, id));
    return NextResponse.json(goal);
  } catch (error) {
    console.error("Failed to update goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(goals).where(eq(goals.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
