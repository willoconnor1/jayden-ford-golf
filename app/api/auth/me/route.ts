import { NextResponse } from "next/server";
import { getAuthUser, createToken, setAuthCookie } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Sliding expiry: issue a fresh token
  const token = await createToken(user);
  await setAuthCookie(token);

  return NextResponse.json({ user, token });
}
