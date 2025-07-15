import { NextRequest, NextResponse } from "next/server";
import { createCmsFactory } from "@/lib/cms/cms-factory";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		const cmsFactory = createCmsFactory();
		const page = await cmsFactory.readPage(slug);

		if (!page) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		return NextResponse.json(page);
	} catch (error) {
		console.error("Error fetching page:", error);
		return NextResponse.json(
			{ error: "Failed to fetch page" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		const data = await request.json();
		const cmsFactory = createCmsFactory();

		// Save page content
		if (data.content) {
			await cmsFactory.savePageContent(slug, data.content);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating page:", error);
		return NextResponse.json(
			{ error: "Failed to update page" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await params;
		const cmsFactory = createCmsFactory();

		// First get the page to find its ID
		const page = await cmsFactory.readPage(slug);
		if (!page) {
			return NextResponse.json({ error: "Page not found" }, { status: 404 });
		}

		await cmsFactory.destroyPage(page.id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting page:", error);
		return NextResponse.json(
			{ error: "Failed to delete page" },
			{ status: 500 },
		);
	}
}
