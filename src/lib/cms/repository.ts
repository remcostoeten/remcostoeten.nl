import { asc, eq } from "drizzle-orm";
import { db } from "@/db/db";
import { contentBlocks, contentSegments } from "@/db/schema";
import type { TContentBlock, TContentSegment, TPageContent } from "./types";
import { parseLinkMetadata } from "./link-metadata";

type TDatabase = typeof db;

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
					order: contentSegments.order,
					href: contentSegments.href,
					target: contentSegments.target,
					className: contentSegments.className,
					style: contentSegments.style,
					metadata: contentSegments.metadata,
				})
				.from(contentSegments)
				.where(eq(contentSegments.blockId, block.id))
				.orderBy(asc(contentSegments.order));

			return {
				id: block.id,
				blockType: block.blockType,
				order: block.order,
				segments: segments.map(segment => {
					let linkMetadata = null;
					if (segment.metadata) {
						try {
							linkMetadata = parseLinkMetadata(segment.metadata);
						} catch (error) {
							console.warn(`Failed to parse link metadata for segment ${segment.id}:`, error);
							linkMetadata = null;
						}
					}
					return {
						...segment,
						linkMetadata,
					};
				}) as TContentSegment[],
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
					order: contentSegments.order,
					href: contentSegments.href,
					target: contentSegments.target,
					className: contentSegments.className,
					style: contentSegments.style,
					metadata: contentSegments.metadata,
				})
				.from(contentSegments)
				.where(eq(contentSegments.blockId, block.id))
				.orderBy(asc(contentSegments.order));

			return {
				id: block.id,
				blockType: block.blockType,
				order: block.order,
				segments: segments.map(segment => {
					let linkMetadata = null;
					if (segment.metadata) {
						try {
							linkMetadata = parseLinkMetadata(segment.metadata);
						} catch (error) {
							console.warn(`Failed to parse link metadata for segment ${segment.id}:`, error);
							linkMetadata = null;
						}
					}
					return {
						...segment,
						linkMetadata,
					};
				}) as TContentSegment[],
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
updatedAt: new Date().toISOString(),
		})
.where(eq(contentSegments.id, Number(id)))
}

export async function createContentBlock(
	database: TDatabase,
	pageId: string,
	blockType: string,
	order: number,
): Promise<string> {
  const blockId = Date.now();

	await database.insert(contentBlocks).values({
		id: blockId,
		pageId,
		blockType,
		order,
	});

  return blockId.toString();
}

export async function createContentSegment(
	database: TDatabase,
	blockId: number,
	text: string,
	type: string,
	order: number,
): Promise<string> {
  const segmentId = Date.now();

	await database.insert(contentSegments).values({
		id: segmentId,
		blockId,
		text,
		type,
		order,
	});

  return segmentId.toString();
}

export async function deleteContentBlock(
	database: TDatabase,
	blockId: string,
): Promise<void> {
	await database.delete(contentBlocks).where(eq(contentBlocks.id, Number(blockId)));
}

export async function deleteContentSegment(
	database: TDatabase,
	segmentId: string,
): Promise<void> {
	await database
		.delete(contentSegments)
		.where(eq(contentSegments.id, Number(segmentId)));
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
updatedAt: new Date().toISOString(),
		})
.where(eq(contentBlocks.id, Number(blockId)));
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
updatedAt: new Date().toISOString(),
		})
.where(eq(contentSegments.id, Number(segmentId)));
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
			order: contentSegments.order,
			href: contentSegments.href,
			target: contentSegments.target,
			className: contentSegments.className,
			style: contentSegments.style,
			metadata: contentSegments.metadata,
		})
		.from(contentSegments)
.where(eq(contentSegments.id, Number(segmentId)))
		.limit(1);

	if (segments.length > 0) {
		const segment = segments[0];
		let linkMetadata = null;
		if (segment.metadata) {
			try {
				linkMetadata = parseLinkMetadata(segment.metadata);
			} catch (error) {
				console.warn(`Failed to parse link metadata for segment ${segment.id}:`, error);
				linkMetadata = null;
			}
		}
		return {
			...segment,
			linkMetadata,
		} as TContentSegment;
	}
	return null;
}
