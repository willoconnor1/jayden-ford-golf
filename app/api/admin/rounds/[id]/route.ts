import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rounds, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rowToRound } from "@/lib/db/helpers";
import { getAuthUser } from "@/lib/auth";

function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

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
