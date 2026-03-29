import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, rounds, goals } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { z } from "zod/v4";

/**
 * GET /api/admin/users — list all users with round/goal counts
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

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users);

    const roundCounts = await db
      .select({
        userId: rounds.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(rounds)
      .groupBy(rounds.userId);
    const roundMap = new Map(roundCounts.map((r) => [r.userId, r.count]));

    const goalCounts = await db
      .select({
        userId: goals.userId,
        count: sql<number>`count(*)::int`,
      })
      .from(goals)
      .groupBy(goals.userId);
    const goalMap = new Map(goalCounts.map((g) => [g.userId, g.count]));

    const result = allUsers.map((u) => ({
      ...u,
      roundCount: roundMap.get(u.id) ?? 0,
      goalCount: goalMap.get(u.id) ?? 0,
    }));

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("Admin users fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/admin/users — create a new user account
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isAdminEmail(authUser.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email: rawEmail, password } = result.data;
    const email = rawEmail.trim().toLowerCase();

    // Check for duplicate email
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash,
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { user: { id: userId, name: name.trim(), email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create user failed:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
