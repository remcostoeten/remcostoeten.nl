import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
	try {
		const response = NextResponse.json({
			success: true,
			message: "Signed out successfully",
		});

		// Clear auth cookie
		response.cookies.set("auth-token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 0,
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Sign out error:", error);

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
