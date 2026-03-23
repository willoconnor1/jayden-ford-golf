import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { goalToRow, rowToGoal } from "@/lib/db/helpers";
import type { Goal } from "@/lib/types";

export async function GET() {
  try {
    const rows = await db.select().from(goals);
    return NextResponse.json(rows.map(rowToGoal));
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const goal: Goal = await request.json();
    await db.insert(goals).values(goalToRow(goal));
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Failed to create goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
