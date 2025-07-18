"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { pages } from "@/db/schema";
import {
	createBlocksFactory,
	createPagesFactory,
	createSegmentsFactory,
} from "./factories";

export async function ensureHomePageExists(): Promise<
	{ success: true; homePageId: number } | { success: false; error: string }
> {
	try {
		const existingPage = await db
			.select()
			.from(pages)
			.where(eq(pages.slug, "home"))
			.limit(1)
			.execute();

		if (existingPage.length > 0) {
			return { success: true, homePageId: existingPage[0].id };
		}

		const newHomePage = await db
			.insert(pages)
			.values({
				slug: "home",
				title: "Home",
				description: null,
				isPublished: 1,
			})
			.returning()
			.execute();

		return { success: true, homePageId: newHomePage[0].id };
	} catch (error) {
		console.error("Failed to ensure home page exists:", error);
		return { success: false, error: "Failed to ensure home page exists" };
	}
}

export async function createPageAction(data: {
	slug: string;
	title: string;
	description?: string;
}) {
	const pagesFactory = createPagesFactory();

	try {
		const newPage = await pagesFactory.create(data);
		return { success: true, data: newPage };
	} catch (error) {
		console.error("Failed to create page:", error);
		return { success: false, error: "Failed to create page" };
	}
}

export async function readPageAction(slug: string) {
	const pagesFactory = createPagesFactory();

	try {
		const page = await pagesFactory.readBySlug(slug);
		return { success: true, data: page };
	} catch (error) {
		console.error("Failed to read page:", error);
		return { success: false, error: "Failed to read page" };
	}
}

export async function readAllPagesAction() {
	const pagesFactory = createPagesFactory();

	try {
		const pages = await pagesFactory.read();
		return { success: true, data: pages };
	} catch (error) {
		console.error("Failed to read all pages:", error);
		return { success: false, error: "Failed to read all pages" };
	}
}

export async function updatePageAction(
	id: string,
	data: { title?: string; description?: string; isPublished?: boolean },
) {
	const pagesFactory = createPagesFactory();

	try {
		const updatedPage = await pagesFactory.update(parseInt(id), data);
		return { success: true, data: updatedPage };
	} catch (error) {
		console.error("Failed to update page:", error);
		return { success: false, error: "Failed to update page" };
	}
}

export async function deletePageAction(id: string) {
	const pagesFactory = createPagesFactory();

	try {
		await pagesFactory.destroy(parseInt(id));
		return { success: true };
	} catch (error) {
		console.error("Failed to delete page:", error);
		return { success: false, error: "Failed to delete page" };
	}
}

export async function createBlockAction(data: {
	pageId: string;
	blockType: string;
	order: number;
}) {
	const blocksFactory = createBlocksFactory();

	try {
		const newBlock = await blocksFactory.create(data);
		return { success: true, data: newBlock };
	} catch (error) {
		console.error("Failed to create block:", error);
		return { success: false, error: "Failed to create block" };
	}
}

export async function readBlockAction(id: string) {
	const blocksFactory = createBlocksFactory();

	try {
		const block = await blocksFactory.read(parseInt(id));
		return { success: true, data: block };
	} catch (error) {
		console.error("Failed to read block:", error);
		return { success: false, error: "Failed to read block" };
	}
}

export async function updateBlockAction(
	id: string,
	data: { blockType?: string; order?: number },
) {
	const blocksFactory = createBlocksFactory();

	try {
		const updatedBlock = await blocksFactory.update(parseInt(id), data);
		return { success: true, data: updatedBlock };
	} catch (error) {
		console.error("Failed to update block:", error);
		return { success: false, error: "Failed to update block" };
	}
}

export async function deleteBlockAction(id: string) {
	const blocksFactory = createBlocksFactory();

	try {
		await blocksFactory.destroy(parseInt(id));
		return { success: true };
	} catch (error) {
		console.error("Failed to delete block:", error);
		return { success: false, error: "Failed to delete block" };
	}
}

export async function createSegmentAction(data: {
	blockId: string;
	order: number;
	text: string;
	type: string;
	href?: string;
	target?: string;
	className?: string;
	style?: string;
	metadata?: string;
}) {
	const segmentsFactory = createSegmentsFactory();

	try {
		const newSegment = await segmentsFactory.create({
			...data,
			blockId: parseInt(data.blockId),
		});
		return { success: true, data: newSegment };
	} catch (error) {
		console.error("Failed to create segment:", error);
		return { success: false, error: "Failed to create segment" };
	}
}

export async function readSegmentAction(id: string) {
	const segmentsFactory = createSegmentsFactory();

	try {
		const segment = await segmentsFactory.read(parseInt(id));
		return { success: true, data: segment };
	} catch (error) {
		console.error("Failed to read segment:", error);
		return { success: false, error: "Failed to read segment" };
	}
}

export async function updateSegmentAction(
	id: string,
	data: {
		blockId?: string;
		order?: number;
		text?: string;
		type?: string;
		href?: string;
		target?: string;
		className?: string;
		style?: string;
		metadata?: string;
	},
) {
	const segmentsFactory = createSegmentsFactory();

	try {
		const updatedSegment = await segmentsFactory.update(parseInt(id), data);
		return { success: true, data: updatedSegment };
	} catch (error) {
		console.error("Failed to update segment:", error);
		return { success: false, error: "Failed to update segment" };
	}
}

export async function deleteSegmentAction(id: string) {
	const segmentsFactory = createSegmentsFactory();

	try {
		await segmentsFactory.destroy(parseInt(id));
		return { success: true };
	} catch (error) {
		console.error("Failed to delete segment:", error);
		return { success: false, error: "Failed to delete segment" };
	}
}

export async function getHomeContentBlocksAction() {
	const { getHomeContentBlocksWithSegments } = await import(
		"./seed-home-content"
	);

	try {
		const blocks = await getHomeContentBlocksWithSegments();
		return { success: true, data: blocks };
	} catch (error) {
		console.error("Failed to get home content blocks:", error);
		return { success: false, error: "Failed to get home content blocks" };
	}
}

export async function ensureHomeContentBlocksAction() {
	const { ensureHomeContentBlocks } = await import("./seed-home-content");

	try {
		const blocks = await ensureHomeContentBlocks();
		return { success: true, data: blocks };
	} catch (error) {
		console.error("Failed to ensure home content blocks:", error);
		return { success: false, error: "Failed to ensure home content blocks" };
	}
}
