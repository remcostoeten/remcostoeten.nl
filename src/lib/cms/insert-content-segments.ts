import { asc, eq } from "drizzle-orm";
import { db } from "@/db/db";
import { contentSegments } from "@/db/schema";
import { serializeLinkMetadata } from "./link-metadata";

type TSegmentData = {
	type: "text" | "link";
	content: string;
	linkOptions?: {
		href: string;
		target?: "_blank" | "_self" | "_parent" | "_top";
		rel?: string;
		className?: string;
		suffix?: string;
	};
};

type TBlockHierarchy = {
	id: number;
	segments: TSegmentData[];
};

async function queryExistingSegments(blockId: number) {
	const segments = await db
		.select()
		.from(contentSegments)
		.where(eq(contentSegments.blockId, blockId))
		.orderBy(asc(contentSegments.order))
		.execute();

	return segments;
}

function buildSegmentObject(
	blockId: number,
	order: number,
	segmentData: TSegmentData,
) {
	const baseSegment = {
		blockId,
		order,
		text: segmentData.content,
		type: segmentData.type,
		metadata: null as string | null,
	};

	if (segmentData.type === "link" && segmentData.linkOptions) {
		const linkMetadata = {
			href: segmentData.linkOptions.href,
			target: segmentData.linkOptions.target || "_blank",
			rel: segmentData.linkOptions.rel || "noopener noreferrer",
			className: segmentData.linkOptions.className || "external-link",
			suffix: segmentData.linkOptions.suffix || " ↗",
		};

		return {
			...baseSegment,
			metadata: serializeLinkMetadata(linkMetadata),
		};
	}

	return baseSegment;
}

export async function insertContentSegments(blockHierarchy: TBlockHierarchy[]) {
	for (const block of blockHierarchy) {
		const existingSegments = await queryExistingSegments(block.id);

		if (existingSegments.length === 0) {
			const segmentArray = [];

			for (let i = 0; i < block.segments.length; i++) {
				const segmentData = block.segments[i];
				const order = i + 1;

				const segmentObject = buildSegmentObject(block.id, order, segmentData);

				segmentArray.push(segmentObject);
			}

			if (segmentArray.length > 0) {
				await db.insert(contentSegments).values(segmentArray);
			}
		}
	}
}
