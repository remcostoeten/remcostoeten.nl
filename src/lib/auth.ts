import * as jose from "jose";
import bcrypt from "bcryptjs";
import { createDb } from "~/db/client";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

const AUTH_COOKIE = "auth-token";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export type TUserPayload = {
  id: number;
  email: string;
  role: string;
};

export async function authenticateUser(email: string, password: string) {
  const db = createDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return { id: user.id, email: user.email, role: user.role } as TUserPayload;
}

export async function generateToken(payload: TUserPayload) {
  const secret = getJwtSecret();
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TUserPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as TUserPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(user: TUserPayload) {
  const token = await generateToken(user);
  const { setCookie } = await import("~/lib/http");
  setCookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const { deleteCookie } = await import("~/lib/http");
  deleteCookie(AUTH_COOKIE, { path: "/" });
}

export async function getCurrentUser(): Promise<TUserPayload | null> {
  const { getCookie } = await import("~/lib/http");
  const token = getCookie(AUTH_COOKIE);
  if (!token) return null;
  return await verifyToken(token);
}
