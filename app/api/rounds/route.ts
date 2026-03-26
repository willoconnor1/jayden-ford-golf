import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { rounds } from "@/lib/db/schema";
import { roundToRow, rowToRound } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";
import type { Round } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db.select().from(rounds).where(eq(rounds.userId, user.userId));
    return NextResponse.json(rows.map(rowToRound));
  } catch (error) {
    console.error("Failed to fetch rounds:", error);
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const round: Round = await request.json();
    await db.insert(rounds).values(roundToRow(round, user.userId));
    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    console.error("Failed to create round:", error);
    return NextResponse.json({ error: "Failed to create round" }, { status: 500 });
  }
}
