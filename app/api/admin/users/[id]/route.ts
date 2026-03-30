import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, rounds, goals } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { rowToRound } from "@/lib/db/helpers";

/**
 * GET /api/admin/users/[id] — fetch user detail with their rounds and goals
 */
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

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [userRounds, userGoals] = await Promise.all([
      db
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
        .from(rounds)
        .where(eq(rounds.userId, id)),
      db
        .select()
        .from(goals)
        .where(eq(goals.userId, id)),
    ]);

    const roundData = userRounds.map((row) => rowToRound(row));

    return NextResponse.json({
      user,
      rounds: roundData,
      goals: userGoals,
    });
  } catch (error) {
    console.error("Admin user detail fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id] — edit user details (name, email, password)
 */
export async function PATCH(
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
    const body = await request.json();

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name && typeof body.name === "string") {
      updates.name = body.name.trim();
    }

    if (body.email && typeof body.email === "string") {
      const email = body.email.trim().toLowerCase();
      // Check for duplicate email (excluding this user)
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, id)))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "This email is already in use" },
          { status: 409 }
        );
      }
      updates.email = email;
    }

    if (body.password && typeof body.password === "string") {
      if (body.password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }
      updates.passwordHash = await hashPassword(body.password);
    }

    await db.update(users).set(updates).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update user failed:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id] — delete user and all their data
 */
export async function DELETE(
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

    // Prevent admin from deleting themselves
    if (id === authUser.userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Cascade: delete goals, rounds, then user
    await db.delete(goals).where(eq(goals.userId, id));
    await db.delete(rounds).where(eq(rounds.userId, id));
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete user failed:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
