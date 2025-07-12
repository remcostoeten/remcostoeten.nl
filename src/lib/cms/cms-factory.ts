import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/db/client";
import { contentBlocks, contentSegments, pages } from "@/db/cms-schema";
import type { TDbContentBlock, TDbContentSegment, TDbPage, TDbPageWithBlocks } from "@/db/types";
import type { TPageContent } from "./types";

export function createCmsFactory() {
	const db = getDb();

	async function createPage(data: { slug: string; title: string; description?: string }) {
		const pageId = nanoid();
		const newPage = await db
			.insert(pages)
			.values({
				id: pageId,
				slug: data.slug,
				title: data.title,
				description: data.description || null,
			})
			.returning()
			.execute();
		
		return newPage[0];
	}

	async function readPage(slug: string): Promise<TDbPageWithBlocks | null> {
		const page = await db
			.select()
			.from(pages)
			.where(eq(pages.slug, slug))
			.limit(1)
			.execute();

		if (!page.length) return null;

		const pageData = page[0];
		const blocks = await db
			.select()
			.from(contentBlocks)
			.where(eq(contentBlocks.pageId, pageData.id))
			.orderBy(asc(contentBlocks.order))
			.execute();

		const blocksWithSegments = await Promise.all(
			blocks.map(async (block) => {
				const segments = await db
					.select()
					.from(contentSegments)
					.where(eq(contentSegments.blockId, block.id))
					.orderBy(asc(contentSegments.order))
					.execute();

				return {
					...block,
					segments,
				};
			})
		);

		return {
			...pageData,
			blocks: blocksWithSegments,
		};
	}

	async function updatePage(id: string, data: Partial<Pick<TDbPage, "title" | "description" | "isPublished">>) {
		const updatedPage = await db
			.update(pages)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(pages.id, id))
			.returning()
			.execute();

		return updatedPage[0];
	}

	async function destroyPage(id: string) {
		await db.delete(pages).where(eq(pages.id, id)).execute();
	}

	async function createBlock(data: {
		pageId: string;
		blockType: string;
		order: number;
	}) {
		const blockId = nanoid();
		const newBlock = await db
			.insert(contentBlocks)
			.values({
				id: blockId,
				pageId: data.pageId,
				blockType: data.blockType,
				order: data.order,
			})
			.returning()
			.execute();

		return newBlock[0];
	}

	async function readBlock(id: string) {
		const block = await db
			.select()
			.from(contentBlocks)
			.where(eq(contentBlocks.id, id))
			.limit(1)
			.execute();

		if (!block.length) return null;

		const segments = await db
			.select()
			.from(contentSegments)
			.where(eq(contentSegments.blockId, id))
			.orderBy(asc(contentSegments.order))
			.execute();

		return {
			...block[0],
			segments,
		};
	}

	async function updateBlock(id: string, data: Partial<Pick<TDbContentBlock, "blockType" | "order">>) {
		const updatedBlock = await db
			.update(contentBlocks)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(contentBlocks.id, id))
			.returning()
			.execute();

		return updatedBlock[0];
	}

	async function destroyBlock(id: string) {
		await db.delete(contentBlocks).where(eq(contentBlocks.id, id)).execute();
	}

	async function createSegment(data: {
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
		const segmentId = nanoid();
		const newSegment = await db
			.insert(contentSegments)
			.values({
				id: segmentId,
				blockId: data.blockId,
				order: data.order,
				text: data.text,
				type: data.type,
				href: data.href || null,
				target: data.target || null,
				className: data.className || null,
				style: data.style || null,
				metadata: data.metadata || null,
			})
			.returning()
			.execute();

		return newSegment[0];
	}

	async function readSegment(id: string) {
		const segment = await db
			.select()
			.from(contentSegments)
			.where(eq(contentSegments.id, id))
			.limit(1)
			.execute();

		return segment[0] || null;
	}

	async function updateSegment(id: string, data: Partial<TDbContentSegment>) {
		const updatedSegment = await db
			.update(contentSegments)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(contentSegments.id, id))
			.returning()
			.execute();

		return updatedSegment[0];
	}

	async function destroySegment(id: string) {
		await db.delete(contentSegments).where(eq(contentSegments.id, id)).execute();
	}

	async function savePageContent(pageId: string, pageContent: TPageContent) {
		return await db.transaction(async (tx) => {
			await tx.delete(contentBlocks).where(eq(contentBlocks.pageId, pageId));

			for (const [blockIndex, block] of pageContent.blocks.entries()) {
				const blockId = block.id || nanoid();
				await tx.insert(contentBlocks).values({
					id: blockId,
					pageId,
					blockType: block.blockType || "section",
					order: block.order || blockIndex + 1,
				});

				for (const [segmentIndex, segment] of block.segments.entries()) {
					const segmentId = segment.id || nanoid();
					await tx.insert(contentSegments).values({
						id: segmentId,
						blockId,
						order: segment.order || segmentIndex + 1,
						text: segment.content,
						type: segment.type,
						href: segment.href || null,
						target: segment.target || null,
						className: segment.className || null,
						style: segment.style || null,
						metadata: segment.metadata || null,
					});
				}
			}
		});
	}

	return {
		createPage,
		readPage,
		updatePage,
		destroyPage,
		createBlock,
		readBlock,
		updateBlock,
		destroyBlock,
		createSegment,
		readSegment,
		updateSegment,
		destroySegment,
		savePageContent,
	};
}
