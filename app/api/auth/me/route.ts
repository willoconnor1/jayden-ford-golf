import { NextResponse } from "next/server";
import { getAuthUser, createToken, setAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const tokenUser = await getAuthUser(request);

  if (!tokenUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch fresh profile data from DB so city/country stay current
  const [dbUser] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      city: users.city,
      state: users.state,
      country: users.country,
    })
    .from(users)
    .where(eq(users.id, tokenUser.userId))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = {
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    city: dbUser.city,
    state: dbUser.state,
    country: dbUser.country,
  };

  // Sliding expiry: issue a fresh token with up-to-date data
  const token = await createToken(user);
  await setAuthCookie(token);

  return NextResponse.json({ user, token });
}
