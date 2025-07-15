import { NextResponse } from "next/server";
import { getRegistrationStatus } from "@/lib/registration";

export async function GET() {
	try {
		const status = getRegistrationStatus();

		return NextResponse.json(status);
	} catch (error) {
		console.error("Registration status check error:", error);

		return NextResponse.json(
			{ error: "Failed to check registration status" },
			{ status: 500 },
		);
	}
}
