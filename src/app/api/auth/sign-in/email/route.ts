import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/db";
import { users } from "@/db/schemas/users";
import { generateToken, verifyPassword } from "@/lib/auth";

const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = signInSchema.parse(body);

		// Find user by email
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		// Verify password
		const isPasswordValid = await verifyPassword(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		// Generate token
		const token = await generateToken({ userId: user.id, email: user.email });

		// Create response
		const response = NextResponse.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		});

		// Set auth cookie
		response.cookies.set("auth-token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Sign in error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: error.errors[0].message },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
