import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

/**
 * DELETE /api/admin/goals/[id] — delete any goal
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
    await db.delete(goals).where(eq(goals.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete goal failed:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
