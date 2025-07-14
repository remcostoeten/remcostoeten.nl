import { NextRequest, NextResponse } from "next/server";
import { markFeedbackAsReadAction } from "@/lib/feedback/server-actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await markFeedbackAsReadAction(id);
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error marking feedback as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
