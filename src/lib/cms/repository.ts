import { asc, eq } from "drizzle-orm";
import { db } from "@/db/db";
import { contentBlocks, contentSegments } from "@/db/schema";
import type { TContentBlock, TContentSegment, TPageContent } from "./types";
import { parseLinkMetadata } from "./link-metadata";

/**
 * Helper function to parse segment metadata and extract link metadata if present
 * @param metadata - The raw metadata string from the segment
 * @param segmentId - The segment ID for logging purposes
 * @returns Parsed link metadata or null if parsing fails or no href found
 */
function parseSegmentLinkMetadata(metadata: string | null, segmentId: number): any | null {
	if (!metadata) return null;
	
	try {
		// Only try to parse if metadata looks like link metadata (contains href)
		const parsed = JSON.parse(metadata);
		if (parsed && typeof parsed === 'object' && parsed.href) {
			return parseLinkMetadata(metadata);
		}
		return null;
	} catch (error) {
		console.warn(
			`Failed to parse link metadata for segment ${segmentId}:`,
			error,
		);
		return null;
	}
}

/**
 * Helper function to parse generic metadata for non-text segments
 * @param metadata - The raw metadata string from the segment
 * @param segmentId - The segment ID for logging purposes
 * @returns Object with linkMetadata and value properties
 */
function parseGenericMetadata(metadata: string | null, segmentId: number): { linkMetadata: any | null; value: any | null } {
	let linkMetadata = null;
	let value = null;
	
	if (!metadata) return { linkMetadata, value };
	
	try {
		// Try to parse metadata for different segment types
		const parsed = JSON.parse(metadata);
		if (parsed && typeof parsed === 'object') {
			if (parsed.href) {
				linkMetadata = parseLinkMetadata(metadata);
			} else {
				// For other types like project-card, store as value
				value = parsed;
			}
		}
	} catch (error) {
		console.warn(
			`Failed to parse metadata for segment ${segmentId}:`,
			error,
		);
	}
	
	return { linkMetadata, value };
}

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
				segments: segments.map((segment) => {
					// Handle different segment types properly
					if (segment.type === "text") {
						// For text segments, try to parse link metadata
						const linkMetadata = parseSegmentLinkMetadata(segment.metadata, segment.id);

						return {
							id: segment.id,
							type: "text" as const,
							content: segment.content,
							order: segment.order,
							href: segment.href,
							target: segment.target,
							className: segment.className,
							style: segment.style,
							metadata: segment.metadata,
							linkMetadata,
						};
					} else if (segment.type === "time-widget") {
						// For time-widget segments, parse the metadata as the widget config
						let value;
						try {
							if (segment.metadata) {
								value = JSON.parse(segment.metadata);
							} else {
								// Try to parse from content field as fallback
								value = segment.content ? JSON.parse(segment.content) : null;
							}
						} catch {
							// Fallback to default time widget config
							value = {
								id: `widget-${segment.id}`,
								timezone: "UTC",
								format: "24h",
								showSeconds: false,
							};
						}

						return {
							id: segment.id,
							type: "time-widget" as const,
							value,
							order: segment.order,
							href: segment.href,
							target: segment.target,
							className: segment.className,
							style: segment.style,
							metadata: segment.metadata,
							linkMetadata: null, // time-widget doesn't have link metadata
						};
					} else {
						// Handle other segment types, preserving their original type
						const { linkMetadata, value } = parseGenericMetadata(segment.metadata, segment.id);

						return {
							id: segment.id,
							type: segment.type as any, // Preserve the original type
							content: segment.content,
							order: segment.order,
							href: segment.href,
							target: segment.target,
							className: segment.className,
							style: segment.style,
							metadata: segment.metadata,
							linkMetadata,
							value,
						};
					}
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
				segments: segments.map((segment) => {
					// Handle different segment types properly
					if (segment.type === "text") {
						// For text segments, try to parse link metadata
						const linkMetadata = parseSegmentLinkMetadata(segment.metadata, segment.id);

						return {
							id: segment.id,
							type: "text" as const,
							content: segment.content,
							order: segment.order,
							href: segment.href,
							target: segment.target,
							className: segment.className,
							style: segment.style,
							metadata: segment.metadata,
							linkMetadata,
						};
					} else if (segment.type === "time-widget") {
						// For time-widget segments, parse the metadata as the widget config
						let value;
						try {
							if (segment.metadata) {
								value = JSON.parse(segment.metadata);
							} else {
								// Try to parse from content field as fallback
								value = segment.content ? JSON.parse(segment.content) : null;
							}
						} catch {
							// Fallback to default time widget config
							value = {
								id: `widget-${segment.id}`,
								timezone: "UTC",
								format: "24h",
								showSeconds: false,
							};
						}

						return {
							id: segment.id,
							type: "time-widget" as const,
							value,
							order: segment.order,
							href: segment.href,
							target: segment.target,
							className: segment.className,
							style: segment.style,
							metadata: segment.metadata,
							linkMetadata: null, // time-widget doesn't have link metadata
						};
					} else {
						// Handle other segment types, preserving their original type
						const { linkMetadata, value } = parseGenericMetadata(segment.metadata, segment.id);

						return {
							id: segment.id,
							type: segment.type as any, // Preserve the original type
							content: segment.content,
							order: segment.order,
							href: segment.href,
							target: segment.target,
							className: segment.className,
							style: segment.style,
							metadata: segment.metadata,
							linkMetadata,
							value,
						};
					}
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
		.where(eq(contentSegments.id, Number(id)));
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
	await database
		.delete(contentBlocks)
		.where(eq(contentBlocks.id, Number(blockId)));
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
		
		// Handle different segment types properly
		if (segment.type === "text") {
			const linkMetadata = parseSegmentLinkMetadata(segment.metadata, segment.id);
			return {
				...segment,
				linkMetadata,
			} as TContentSegment;
		} else if (segment.type === "time-widget") {
			// Parse the value from metadata for time-widget segments
			let value;
			try {
				if (segment.metadata) {
					value = JSON.parse(segment.metadata);
				} else {
					// Fallback to default time widget config
					value = {
						id: `widget-${segment.id}`,
						timezone: "UTC",
						format: "24h",
						showSeconds: false,
					};
				}
			} catch {
				// Fallback to default time widget config
				value = {
					id: `widget-${segment.id}`,
					timezone: "UTC",
					format: "24h",
					showSeconds: false,
				};
			}
			
			return {
				...segment,
				value,
				linkMetadata: null, // time-widget doesn't have link metadata
			} as TContentSegment;
		} else {
			// Handle other segment types
			const { linkMetadata, value } = parseGenericMetadata(segment.metadata, segment.id);
			return {
				...segment,
				linkMetadata,
				value,
			} as TContentSegment;
		}
	}
	return null;
}

export async function updateHomePageContent(
	database: TDatabase,
	pageContent: TPageContent,
): Promise<void> {
	return await database.transaction(async (tx) => {
		// First, delete all existing home page content
		await tx
			.delete(contentBlocks)
			.where(eq(contentBlocks.pageId, "home"));

		// Then, insert the new content
		for (const block of pageContent.blocks) {
			const [createdBlock] = await tx
				.insert(contentBlocks)
				.values({
					pageId: "home",
					blockType: block.blockType ?? "content",
					order: block.order ?? 0,
				})
				.returning()
				.execute();

			// Insert segments for this block
			for (const segment of block.segments) {
				await tx
					.insert(contentSegments)
					.values({
						blockId: createdBlock.id,
						order: segment.order ?? 0,
						text: segment.content ?? "",
						type: segment.type,
						href: segment.href,
						target: segment.target,
						className: segment.className,
						style: segment.style,
						metadata: segment.metadata,
					})
					.execute();
			}
		}
	});
}
