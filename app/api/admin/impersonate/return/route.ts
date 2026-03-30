import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

/**
 * POST /api/admin/impersonate/return — return to admin session
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin-return-token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { error: "No admin session to return to" },
        { status: 400 }
      );
    }

    // Verify the stashed admin token is still valid
    const adminUser = await verifyToken(adminToken);
    if (!adminUser) {
      cookieStore.delete("admin-return-token");
      return NextResponse.json(
        { error: "Admin session expired" },
        { status: 401 }
      );
    }

    // Verify they're still an admin
    if (!isAdminEmail(adminUser.email)) {
      cookieStore.delete("admin-return-token");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Restore the admin token as the active auth
    cookieStore.set("golf-auth-token", adminToken, COOKIE_OPTS);

    // Clean up the stashed token
    cookieStore.delete("admin-return-token");

    return NextResponse.json({
      success: true,
      user: {
        userId: adminUser.userId,
        email: adminUser.email,
        name: adminUser.name,
      },
    });
  } catch (error) {
    console.error("Return from impersonation failed:", error);
    return NextResponse.json(
      { error: "Failed to return to admin session" },
      { status: 500 }
    );
  }
}
