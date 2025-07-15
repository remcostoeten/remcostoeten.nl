import { NextResponse } from "next/server";
import { getUnreadFeedbackCountAction } from "@/lib/feedback/server-actions";

export async function GET() {
	try {
		const result = await getUnreadFeedbackCountAction();

		if (result.success) {
			return NextResponse.json({ count: result.data }, { status: 200 });
		} else {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error("Error fetching unread feedback count:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
