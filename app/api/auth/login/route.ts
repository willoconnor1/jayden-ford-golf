import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const email = result.data.email.trim().toLowerCase();

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const valid = await verifyPassword(result.data.password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const authUser = { userId: user.id, email: user.email, name: user.name, city: user.city, state: user.state, country: user.country, distanceUnit: (user.distanceUnit ?? "yards") as "yards" | "meters", benchmarkLevel: user.benchmarkLevel ?? "pga-tour" };
    const token = await createToken(authUser);
    await setAuthCookie(token);

    return NextResponse.json({ user: authUser, token });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
