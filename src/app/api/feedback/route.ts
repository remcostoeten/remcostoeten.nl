import { NextRequest, NextResponse } from "next/server";
import {
	createFeedbackAction,
	readFeedbacksAction,
} from "@/lib/feedback/server-actions";

function extractBrowserFromUserAgent(userAgent: string): string {
	const ua = userAgent.toLowerCase();

	if (ua.includes("chrome") && !ua.includes("edg")) {
		return "Chrome";
	}
	if (ua.includes("firefox")) {
		return "Firefox";
	}
	if (ua.includes("safari") && !ua.includes("chrome")) {
		return "Safari";
	}
	if (ua.includes("edg")) {
		return "Edge";
	}
	if (ua.includes("opera") || ua.includes("opr")) {
		return "Opera";
	}

	return "Unknown";
}

export async function GET() {
	try {
		const result = await readFeedbacksAction();

		if (result.success) {
			return NextResponse.json(result.data, { status: 200 });
		} else {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error("Error fetching feedback:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const ipAddress = request.headers.get("x-forwarded-for") ?? request.ip;
		const userAgent = request.headers.get("user-agent") ?? "";
		const referrer = request.headers.get("referer") ?? "";
		const browser = extractBrowserFromUserAgent(userAgent);

		const feedbackData = {
			...body,
			ipAddress,
			userAgent,
			referrer,
			browser,
		};

		const result = await createFeedbackAction(feedbackData);

		if (result.success) {
			return NextResponse.json(result.data, { status: 201 });
		} else {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error("Error processing feedback:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
