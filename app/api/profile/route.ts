import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAuthUser, createToken, setAuthCookie } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  birthdate: z.string().nullable().optional(),
  handicap: z.number().min(-10).max(45).nullable().optional(),
  homeClub: z.string().max(100).nullable().optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).nullable().optional(),
  country: z.string().min(1, "Country is required").max(100),
  isCollegePlayer: z.boolean().optional(),
  collegeName: z.string().max(100).nullable().optional(),
  isTourPlayer: z.boolean().optional(),
  tourName: z.string().max(100).nullable().optional(),
  distanceUnit: z.enum(["yards", "meters"]).optional(),
  benchmarkLevel: z.enum(["hdcp-18", "hdcp-13", "hdcp-9", "hdcp-4", "scratch", "pga-tour"]).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    if (!row) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      name: row.name,
      email: row.email,
      birthdate: row.birthdate,
      handicap: row.handicap,
      homeClub: row.homeClub,
      city: row.city,
      state: row.state,
      country: row.country,
      isCollegePlayer: row.isCollegePlayer ?? false,
      collegeName: row.collegeName,
      isTourPlayer: row.isTourPlayer ?? false,
      tourName: row.tourName,
      distanceUnit: row.distanceUnit ?? "yards",
      benchmarkLevel: row.benchmarkLevel ?? "pga-tour",
      createdAt: row.createdAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const result = profileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;
    const now = new Date().toISOString();

    await db
      .update(users)
      .set({
        name: data.name,
        birthdate: data.birthdate ?? null,
        handicap: data.handicap ?? null,
        homeClub: data.homeClub ?? null,
        city: data.city,
        state: data.state ?? null,
        country: data.country,
        isCollegePlayer: data.isCollegePlayer ?? false,
        collegeName: data.isCollegePlayer ? (data.collegeName ?? null) : null,
        isTourPlayer: data.isTourPlayer ?? false,
        tourName: data.isTourPlayer ? (data.tourName ?? null) : null,
        distanceUnit: data.distanceUnit ?? undefined,
        benchmarkLevel: data.benchmarkLevel ?? undefined,
        updatedAt: now,
      })
      .where(eq(users.id, user.userId));

    // Refresh token with updated profile data
    // Read back fields from DB if not in this request
    const [freshRow] = await db.select({ distanceUnit: users.distanceUnit, benchmarkLevel: users.benchmarkLevel }).from(users).where(eq(users.id, user.userId)).limit(1);

    const authUser = {
      userId: user.userId,
      email: user.email,
      name: data.name,
      city: data.city,
      state: data.state ?? null,
      country: data.country,
      distanceUnit: (data.distanceUnit ?? freshRow?.distanceUnit ?? "yards") as "yards" | "meters",
      benchmarkLevel: data.benchmarkLevel ?? freshRow?.benchmarkLevel ?? "pga-tour",
    };
    const token = await createToken(authUser);
    await setAuthCookie(token);

    return NextResponse.json({ user: authUser, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
