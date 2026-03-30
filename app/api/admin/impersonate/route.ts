import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser, createToken } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

/**
 * POST /api/admin/impersonate — start impersonating a user
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

    const { userId } = await request.json();
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (userId === authUser.userId) {
      return NextResponse.json({ error: "Cannot impersonate yourself" }, { status: 400 });
    }

    // Look up target user
    const [targetUser] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save admin's current token before overwriting
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("golf-auth-token")?.value;

    if (!adminToken) {
      return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    // Create a token for the target user
    const impersonateToken = await createToken({
      userId: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
    });

    // Set the impersonation token as active auth
    cookieStore.set("golf-auth-token", impersonateToken, COOKIE_OPTS);

    // Stash the admin's original token
    cookieStore.set("admin-return-token", adminToken, COOKIE_OPTS);

    return NextResponse.json({
      success: true,
      user: {
        userId: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
      },
    });
  } catch (error) {
    console.error("Impersonation failed:", error);
    return NextResponse.json(
      { error: "Failed to start impersonation" },
      { status: 500 }
    );
  }
}
