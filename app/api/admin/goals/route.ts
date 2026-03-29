import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals, users } from "@/lib/db/schema";
import { rowToGoal } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/goals — list all goals across all users
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

    const allGoals = await db.select().from(goals);
    const allUsers = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users);
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const result = allGoals.map((row) => {
      const user = userMap.get(row.userId);
      return {
        ...rowToGoal(row),
        userId: row.userId,
        userName: user?.name ?? "Unknown",
        userEmail: user?.email ?? "",
      };
    });

    return NextResponse.json({ goals: result, users: allUsers });
  } catch (error) {
    console.error("Admin goals fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}
