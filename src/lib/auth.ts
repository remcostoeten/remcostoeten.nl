import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET =
	process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

export async function generateToken(payload: {
	userId: number;
	email: string;
}): Promise<string> {
	const encoder = new TextEncoder();
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("7d")
		.sign(encoder.encode(JWT_SECRET));
}

export async function verifyToken(
	token: string,
): Promise<{ userId: number; email: string } | null> {
	try {
		const encoder = new TextEncoder();
		const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));
		return payload as { userId: number; email: string };
	} catch (error) {
		return null;
	}
}

export async function setAuthCookie(token: string) {
	const cookieStore = cookies();
	(await cookieStore)?.set("auth-token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 24 * 7, // 7 days
		path: "/",
	});
}

export async function getAuthToken(): Promise<string | null> {
	const cookieStore = cookies();
	return (await cookieStore)?.get("auth-token")?.value || null;
}

export async function clearAuthCookie() {
	const cookieStore = cookies();
	(await cookieStore)?.set("auth-token", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 0,
		path: "/",
	});
}

export async function getCurrentUser(): Promise<{
	userId: number;
	email: string;
} | null> {
	const token = await getAuthToken();
	if (!token) return null;

	return await verifyToken(token);
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
	return request.cookies.get("auth-token")?.value || null;
}

export async function verifyAuthFromRequest(
	request: NextRequest,
): Promise<{ userId: number; email: string } | null> {
	const token = getAuthTokenFromRequest(request);
	if (!token) return null;

	return await verifyToken(token);
}
