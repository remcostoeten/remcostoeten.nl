import { InferSelectModel } from "drizzle-orm";
import {
	contentBlocks,
	contentSegments,
	pages,
	stylePresets,
} from "./cms-schema";

export type TDbPage = InferSelectModel<typeof pages>;
export type TDbContentBlock = InferSelectModel<typeof contentBlocks>;
export type TDbContentSegment = InferSelectModel<typeof contentSegments>;
export type TDbStylePreset = InferSelectModel<typeof stylePresets>;

export type TDbContentBlockWithSegments = TDbContentBlock & {
	segments: TDbContentSegment[];
};

export type TDbPageWithBlocks = TDbPage & {
	blocks: TDbContentBlockWithSegments[];
};

export type TTimestamps = {
	createdAt: Date;
	updatedAt: Date;
};

export type TBaseEntity = {
	id: string;
} & TTimestamps;

export type TPageContent = {
	blocks: Array<{
		id: string;
		segments: Array<{
			id: string;
			type: string;
			content: string;
		}>;
	}>;
};

export type TContentSegment = {
	id: string;
	type: string;
	content: string;
};

export type TContentBlock = {
	id: string;
	segments: TContentSegment[];
};

type TDrizzlePageContent = {
	blocks: TDbContentBlockWithSegments[];
};

export function transformDbPageToPageContent(
	dbPage: TDbPageWithBlocks,
): TPageContent {
	return {
		blocks: dbPage.blocks.map((block) => ({
			id: block.id,
			segments: block.segments.map((segment) => ({
				id: segment.id,
				type: segment.type,
				content: segment.text,
			})),
		})),
	};
}

export function transformPageContentToDb(
	pageContent: TPageContent,
	pageId: string,
): {
	blocks: Omit<TDbContentBlock, "createdAt" | "updatedAt">[];
	segments: Omit<TDbContentSegment, "createdAt" | "updatedAt">[];
} {
	const blocks: Omit<TDbContentBlock, "createdAt" | "updatedAt">[] = [];
	const segments: Omit<TDbContentSegment, "createdAt" | "updatedAt">[] = [];

	pageContent.blocks.forEach((block, blockIndex) => {
		blocks.push({
			id: block.id,
			pageId,
			blockType: "section",
			order: blockIndex + 1,
		});

		block.segments.forEach((segment, segmentIndex) => {
			segments.push({
				id: segment.id,
				blockId: block.id,
				order: segmentIndex + 1,
				text: segment.content,
				type: segment.type,
				href: null,
				target: null,
				className: null,
				style: null,
				metadata: null,
			});
		});
	});

	return { blocks, segments };
}
