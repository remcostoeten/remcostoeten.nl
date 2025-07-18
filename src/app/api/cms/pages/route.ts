import { NextRequest, NextResponse } from "next/server";
import { createCmsFactory } from "@/lib/cms/cms-factory";

export async function GET() {
	try {
		// This would need to be implemented to get all pages
		// For now, return empty array
		return NextResponse.json([]);
	} catch (error) {
		console.error("Error fetching pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pages" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const data = await request.json();
		const cmsFactory = createCmsFactory();

		const newPage = await cmsFactory.createPage({
			slug: data.slug,
			title: data.title,
			description: data.description,
		});

		return NextResponse.json(newPage);
	} catch (error) {
		console.error("Error creating page:", error);
		return NextResponse.json(
			{ error: "Failed to create page" },
			{ status: 500 },
		);
	}
}
