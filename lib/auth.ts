import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "golf-auth-token";
const TOKEN_EXPIRY = "7d";

// ── Types ──────────────────────────────────────────────────────────
export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  distanceUnit: "yards" | "meters";
  benchmarkLevel: string;
}

// ── Password ───────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ────────────────────────────────────────────────────────────
export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    sub: user.userId,
    email: user.email,
    name: user.name,
    city: user.city ?? null,
    state: user.state ?? null,
    country: user.country ?? null,
    distanceUnit: user.distanceUnit ?? "yards",
    benchmarkLevel: user.benchmarkLevel ?? "pga-tour",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.sub!,
      email: payload.email as string,
      name: payload.name as string,
      city: (payload.city as string) ?? null,
      state: (payload.state as string) ?? null,
      country: (payload.country as string) ?? null,
      distanceUnit: ((payload.distanceUnit as string) ?? "yards") as "yards" | "meters",
      benchmarkLevel: (payload.benchmarkLevel as string) ?? "pga-tour",
    };
  } catch {
    return null;
  }
}

// ── Cookie helpers (web) ───────────────────────────────────────────
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Unified auth extractor ─────────────────────────────────────────
// Checks Bearer header first (mobile), then cookie (web).
export async function getAuthUser(
  request?: Request
): Promise<AuthUser | null> {
  // 1. Try Bearer header (mobile)
  if (request) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return verifyToken(authHeader.slice(7));
    }
  }

  // 2. Try cookie (web)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) return verifyToken(token);
  } catch {
    // cookies() throws outside of request context
  }

  return null;
}
