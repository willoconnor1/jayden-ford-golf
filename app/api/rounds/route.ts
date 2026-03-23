import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rounds } from "@/lib/db/schema";
import { roundToRow, rowToRound } from "@/lib/db/helpers";
import type { Round } from "@/lib/types";

export async function GET() {
  try {
    const rows = await db.select().from(rounds);
    return NextResponse.json(rows.map(rowToRound));
  } catch (error) {
    console.error("Failed to fetch rounds:", error);
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const round: Round = await request.json();
    await db.insert(rounds).values(roundToRow(round));
    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    console.error("Failed to create round:", error);
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 }
    );
  }
}
