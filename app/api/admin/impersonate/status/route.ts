import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/impersonate/status — check if currently impersonating
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin-return-token")?.value;

    if (!adminToken) {
      return NextResponse.json({ impersonating: false });
    }

    const adminUser = await verifyToken(adminToken);
    if (!adminUser) {
      // Stale token — clean it up
      cookieStore.delete("admin-return-token");
      return NextResponse.json({ impersonating: false });
    }

    return NextResponse.json({
      impersonating: true,
      adminName: adminUser.name,
      adminEmail: adminUser.email,
    });
  } catch {
    return NextResponse.json({ impersonating: false });
  }
}
