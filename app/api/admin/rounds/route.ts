import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rounds, users } from "@/lib/db/schema";
import { rowToRound } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/rounds — returns all users' rounds (admin only)
 */
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminEmail(authUser.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all rounds
    const allRounds = await db
      .select({
        id: rounds.id,
        userId: rounds.userId,
        date: rounds.date,
        courseName: rounds.courseName,
        courseTees: rounds.courseTees,
        courseRating: rounds.courseRating,
        courseSlope: rounds.courseSlope,
        courseTotalPar: rounds.courseTotalPar,
        courseHolePars: rounds.courseHolePars,
        courseHoleDistances: rounds.courseHoleDistances,
        holes: rounds.holes,
        totalScore: rounds.totalScore,
        notes: rounds.notes,
        createdAt: rounds.createdAt,
        updatedAt: rounds.updatedAt,
      })
      .from(rounds);

    // Get all user names
    const allUsers = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users);
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const result = allRounds.map((row) => {
      const user = userMap.get(row.userId);
      return {
        ...rowToRound(row),
        userId: row.userId,
        userName: user?.name ?? "Unknown",
        userEmail: user?.email ?? "",
      };
    });

    return NextResponse.json({
      rounds: result,
      users: allUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })),
    });
  } catch (error) {
    console.error("Admin rounds fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch admin rounds" }, { status: 500 });
  }
}
