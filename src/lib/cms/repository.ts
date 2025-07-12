import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { contentBlocks, contentSegments } from "@/db/schema";
import type { TContentBlock, TContentSegment, TPageContent } from "./types";

type TDatabase = ReturnType<typeof getDb>;

export async function getHomePageContent(
	database: TDatabase,
): Promise<TPageContent> {
	const blocks = await database
		.select()
		.from(contentBlocks)
		.where(eq(contentBlocks.pageId, "home"))
		.orderBy(asc(contentBlocks.order));

	const blocksWithSegments: TContentBlock[] = await Promise.all(
		blocks.map(async (block) => {
			const segments = await database
				.select({
					id: contentSegments.id,
					type: contentSegments.type,
					content: contentSegments.text,
				})
				.from(contentSegments)
				.where(eq(contentSegments.blockId, block.id))
				.orderBy(asc(contentSegments.order));

			return {
				id: block.id,
				segments: segments as TContentSegment[],
			};
		}),
	);

	return {
		blocks: blocksWithSegments,
	};
}

export async function getPageContent(
	database: TDatabase,
	pageId: string,
): Promise<TPageContent> {
	const blocks = await database
		.select()
		.from(contentBlocks)
		.where(eq(contentBlocks.pageId, pageId))
		.orderBy(asc(contentBlocks.order));

	const blocksWithSegments: TContentBlock[] = await Promise.all(
		blocks.map(async (block) => {
			const segments = await database
				.select({
					id: contentSegments.id,
					type: contentSegments.type,
					content: contentSegments.text,
				})
				.from(contentSegments)
				.where(eq(contentSegments.blockId, block.id))
				.orderBy(asc(contentSegments.order));

			return {
				id: block.id,
				segments: segments as TContentSegment[],
			};
		}),
	);

	return {
		blocks: blocksWithSegments,
	};
}

export async function updateSegmentText(
	database: TDatabase,
	id: string,
	text: string,
): Promise<void> {
	await database
		.update(contentSegments)
		.set({
			text,
			updatedAt: new Date(),
		})
		.where(eq(contentSegments.id, id));
}

export async function createContentBlock(
	database: TDatabase,
	pageId: string,
	blockType: string,
	order: number,
): Promise<string> {
	const blockId = `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

	await database.insert(contentBlocks).values({
		id: blockId,
		pageId,
		blockType,
		order,
	});

	return blockId;
}

export async function createContentSegment(
	database: TDatabase,
	blockId: string,
	text: string,
	type: string,
	order: number,
): Promise<string> {
	const segmentId = `segment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

	await database.insert(contentSegments).values({
		id: segmentId,
		blockId,
		text,
		type,
		order,
	});

	return segmentId;
}

export async function deleteContentBlock(
	database: TDatabase,
	blockId: string,
): Promise<void> {
	await database.delete(contentBlocks).where(eq(contentBlocks.id, blockId));
}

export async function deleteContentSegment(
	database: TDatabase,
	segmentId: string,
): Promise<void> {
	await database
		.delete(contentSegments)
		.where(eq(contentSegments.id, segmentId));
}

export async function updateBlockOrder(
	database: TDatabase,
	blockId: string,
	newOrder: number,
): Promise<void> {
	await database
		.update(contentBlocks)
		.set({
			order: newOrder,
			updatedAt: new Date(),
		})
		.where(eq(contentBlocks.id, blockId));
}

export async function updateSegmentOrder(
	database: TDatabase,
	segmentId: string,
	newOrder: number,
): Promise<void> {
	await database
		.update(contentSegments)
		.set({
			order: newOrder,
			updatedAt: new Date(),
		})
		.where(eq(contentSegments.id, segmentId));
}

export async function getContentSegmentById(
	database: TDatabase,
	segmentId: string,
): Promise<TContentSegment | null> {
	const segments = await database
		.select({
			id: contentSegments.id,
			type: contentSegments.type,
			content: contentSegments.text,
		})
		.from(contentSegments)
		.where(eq(contentSegments.id, segmentId))
		.limit(1);

	return segments.length > 0 ? (segments[0] as TContentSegment) : null;
}
