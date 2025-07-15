import { NextRequest, NextResponse } from "next/server";
import { createCmsFactory } from "@/lib/cms/cms-factory";

export async function POST(request: NextRequest) {
	try {
		const { pageIds } = await request.json();
		
		if (!Array.isArray(pageIds) || pageIds.length === 0) {
			return NextResponse.json(
				{ error: "Invalid page IDs provided" },
				{ status: 400 }
			);
		}

		const cmsFactory = createCmsFactory();
		
		for (const pageId of pageIds) {
			const page = await cmsFactory.readPage(pageId);
			if (!page) {
				continue;
			}
			
			if (page.slug === "home") {
				continue;
			}
			
			await cmsFactory.destroyPage(page.id);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error bulk deleting pages:", error);
		return NextResponse.json(
			{ error: "Failed to bulk delete pages" },
			{ status: 500 }
		);
	}
}
