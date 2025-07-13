import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import {
	createErrorResponse,
	createSuccessResponse,
	validateRequestBody,
} from "@/lib/api/utils";
import { getContentSegmentById, updateSegmentText } from "@/lib/cms/repository";
import {
	type TUpdateSegmentResponse,
	UpdateSegmentRequestSchema,
} from "@/lib/cms/types";

type TRouteParams = {
	params: {
		id: string;
	};
};

export async function PATCH(request: NextRequest, { params }: TRouteParams) {
	try {
		// Check if we're in build mode and return early
		if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
			return createErrorResponse("Database not configured", 503);
		}

		const { id } = params;

		if (!id) {
			return createErrorResponse("Segment ID is required", 400);
		}

		const body = await request.json();

		// Validate request body
		const validationResult = validateRequestBody(
			body,
			UpdateSegmentRequestSchema,
		);
		if (!validationResult.success) {
			return createErrorResponse(
				`Invalid request: ${validationResult.error}`,
				400,
			);
		}

		if (!validationResult.data) {
			return createErrorResponse("Invalid request data", 400);
		}

		const { content } = validationResult.data;

		// Check if segment exists
		const existingSegment = await getContentSegmentById(db, id);
		if (!existingSegment) {
			return createErrorResponse("Segment not found", 404);
		}

		// Update segment
		await updateSegmentText(db, id, content);

		// Get updated segment
		const updatedSegment = await getContentSegmentById(db, id);

		const response: TUpdateSegmentResponse = {
			success: true,
			segment: updatedSegment || undefined,
		};

		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		console.error("Error updating segment:", error);
		return createErrorResponse("Internal server error", 500);
	}
}
