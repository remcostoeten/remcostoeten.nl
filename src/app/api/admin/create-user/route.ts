import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	// No-op - user creation disabled after auth purge
	return NextResponse.json(
		{
			error: "User creation disabled - authentication system removed",
		},
		{ status: 404 },
	);
}
