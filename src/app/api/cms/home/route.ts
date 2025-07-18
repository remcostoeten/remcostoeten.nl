import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { createErrorResponse, validateResponseData } from "@/lib/api/utils";
import { getHomePageContent } from "@/lib/cms/repository";
import { PageContentSchema, type THomePageResponse } from "@/lib/cms/types";

export async function GET(_request: NextRequest) {
	try {
		// Check if we're in build mode and return early
		if (
			process.env.NODE_ENV === "production" &&
			!process.env.TURSO_DATABASE_URL
		) {
			return createErrorResponse("Database not configured", 503);
		}

		// Get home page content from repository
		const pageContent = await getHomePageContent(db);

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

export async function POST(_request: NextRequest) {
	try {
		// Check if we're in build mode and return early
		if (
			process.env.NODE_ENV === "production" &&
			!process.env.TURSO_DATABASE_URL
		) {
			return createErrorResponse("Database not configured", 503);
		}

		// Import the seeding function
		const { ensureHomeContentBlocks } = await import(
			"@/lib/cms/seed-home-content"
		);

		// Ensure homepage content exists (will seed if needed)
		await ensureHomeContentBlocks();

		// Get the updated content
		const pageContent = await getHomePageContent(db);

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
		console.error("Error ensuring home page content:", error);
		return createErrorResponse("Internal server error", 500);
	}
}

export async function PUT(request: NextRequest) {
	try {
		// Check if we're in build mode and return early
		if (
			process.env.NODE_ENV === "production" &&
			!process.env.TURSO_DATABASE_URL
		) {
			return createErrorResponse("Database not configured", 503);
		}

		// Parse the request body
		const body = await request.json();
		const { content } = body;

		if (!content || !content.blocks) {
			return createErrorResponse("Invalid content structure", 400);
		}

		// Import the repository functions
		const { updateHomePageContent } = await import(
			"@/lib/cms/repository"
		);

		// Update the homepage content in the database
		await updateHomePageContent(db, content);

		// Get the updated content
		const updatedContent = await getHomePageContent(db);

		// Validate the updated content
		const contentValidation = validateResponseData(
			updatedContent,
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
		console.error("Error updating home page content:", error);
		return createErrorResponse("Internal server error", 500);
	}
}
