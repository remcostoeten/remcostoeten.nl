import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import {
	createErrorResponse,
	createSuccessResponse,
	validateResponseData,
} from "@/lib/api/utils";
import { getHomePageContent } from "@/lib/cms/repository";
import { PageContentSchema, type THomePageResponse } from "@/lib/cms/types";

export async function GET(request: NextRequest) {
	try {
		// Check if we're in build mode and return early
		if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
			return createErrorResponse("Database not configured", 503);
		}

		// Get home page content from repository
		const pageContent = await getHomePageContent(db());

		// Validate the page content with Zod
		const contentValidation = validateResponseData(
			pageContent,
			PageContentSchema,
		);
		if (!contentValidation.success) {
			return createErrorResponse(
				contentValidation.error || "Validation failed",
				500,
			);
		}

		const response: THomePageResponse = {
			success: true,
			data: contentValidation.data,
		};

		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		console.error("Error fetching home page content:", error);
		return createErrorResponse("Internal server error", 500);
	}
}
