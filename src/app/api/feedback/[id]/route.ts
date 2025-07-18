import { NextRequest, NextResponse } from "next/server";
import { deleteFeedbackAction } from "@/lib/feedback/server-actions";

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const result = await deleteFeedbackAction(id);

		if (result.success) {
			return NextResponse.json(
				{ message: "Feedback deleted successfully" },
				{ status: 200 },
			);
		} else {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error("Error deleting feedback:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
