import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { goalToRow, rowToGoal } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";
import type { Goal } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db.select().from(goals).where(eq(goals.userId, user.userId));
    return NextResponse.json(rows.map(rowToGoal));
  } catch (error) {
    console.error("Failed to fetch goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const goal: Goal = await request.json();
    await db.insert(goals).values(goalToRow(goal, user.userId));
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Failed to create goal:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
