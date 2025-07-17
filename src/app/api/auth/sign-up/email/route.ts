import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/db";
import { users } from "@/db/schemas/users";
import { generateToken, hashPassword } from "@/lib/auth";

const signUpSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	name: z.string().min(1, "Name is required"),
});

export async function POST(request: NextRequest) {
	try {
		// Check if registration is enabled
		const registrationEnabled = process.env.ENABLE_REGISTER === "true";
		if (!registrationEnabled) {
			return NextResponse.json(
				{ error: "Registration is currently disabled" },
				{ status: 403 },
			);
		}

		const body = await request.json();
		const { email, password, name } = signUpSchema.parse(body);

		// Check if user already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser.length > 0) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 400 },
			);
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create user
		const [newUser] = await db
			.insert(users)
			.values({
				email,
				name,
				password: hashedPassword,
			})
			.returning();

		// Generate token
		const token = await generateToken({
			userId: newUser.id,
			email: newUser.email,
		});

		// Create response
		const response = NextResponse.json({
			success: true,
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
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
		console.error("Sign up error:", error);

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
