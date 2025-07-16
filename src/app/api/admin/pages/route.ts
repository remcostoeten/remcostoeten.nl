import { NextRequest, NextResponse } from "next/server";
import { verifyAuthFromRequest } from "@/lib/auth";
import { createPagesFactory } from "@/lib/cms/factories";

export async function GET(request: NextRequest) {
	try {
		const auth = await verifyAuthFromRequest(request);

		if (!auth || !auth.userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const pagesFactory = createPagesFactory();
		const pages = await pagesFactory.read();

		const transformedPages = pages.map((page) => ({
			id: page.id,
			slug: page.slug,
			title: page.title,
			isHomepage: Boolean(page.isHomepage),
			updatedAt: page.updatedAt,
		}));

		return NextResponse.json(transformedPages);
	} catch (error) {
		console.error("Error fetching pages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch pages" },
			{ status: 500 },
		);
	}
}
