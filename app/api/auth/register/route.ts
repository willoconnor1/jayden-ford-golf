import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birthdate: z.string().min(1, "Birthdate is required").optional(),
  handicap: z.number().min(-10).max(45).optional(),
  homeClub: z.string().max(100).optional(),
  city: z.string().min(1, "City is required").max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().min(1, "Country is required").max(100).optional(),
  isCollegePlayer: z.boolean().optional(),
  collegeName: z.string().max(100).optional(),
  isTourPlayer: z.boolean().optional(),
  tourName: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email: rawEmail, password, ...profile } = result.data;
    const email = rawEmail.trim().toLowerCase();

    // Check if email already exists
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
      birthdate: profile.birthdate ?? null,
      handicap: profile.handicap ?? null,
      homeClub: profile.homeClub ?? null,
      city: profile.city ?? null,
      state: profile.state ?? null,
      country: profile.country ?? null,
      isCollegePlayer: profile.isCollegePlayer ?? false,
      collegeName: profile.isCollegePlayer ? (profile.collegeName ?? null) : null,
      isTourPlayer: profile.isTourPlayer ?? false,
      tourName: profile.isTourPlayer ? (profile.tourName ?? null) : null,
      createdAt: now,
      updatedAt: now,
    });

    const authUser = { userId, email, name: name.trim(), city: profile.city ?? null, state: profile.state ?? null, country: profile.country ?? null };
    const token = await createToken(authUser);
    await setAuthCookie(token);

    return NextResponse.json({ user: authUser, token }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
