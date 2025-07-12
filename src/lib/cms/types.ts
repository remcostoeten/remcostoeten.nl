import { z } from "zod";
import type { TDbContentBlock, TDbContentSegment, TDbPage } from "@/db/types";

// Define TypeScript types that align with database schema
export type TContentSegment = {
	id: string;
	type: string;
	content: string;
	order?: number;
	href?: string | null;
	target?: string | null;
	className?: string | null;
	style?: string | null;
	metadata?: string | null;
};

export type TContentBlock = {
	id: string;
	blockType?: string;
	order?: number;
	segments: TContentSegment[];
};

export type TPageContent = {
	blocks: TContentBlock[];
};

// Database-aligned types
export type TDbContentBlockWithSegments = TDbContentBlock & {
	segments: TDbContentSegment[];
};

export type TDbPageWithBlocks = TDbPage & {
	blocks: TDbContentBlockWithSegments[];
};

// Create Zod schemas for runtime validation
export const ContentSegmentSchema = z.object({
	id: z.string(),
	type: z.string(),
	content: z.string(),
	order: z.number().optional(),
	href: z.string().nullable().optional(),
	target: z.string().nullable().optional(),
	className: z.string().nullable().optional(),
	style: z.string().nullable().optional(),
	metadata: z.string().nullable().optional(),
});

export const ContentBlockSchema = z.object({
	id: z.string(),
	blockType: z.string().optional(),
	order: z.number().optional(),
	segments: z.array(ContentSegmentSchema),
});

export const PageContentSchema = z.object({
	blocks: z.array(ContentBlockSchema),
});

// API request/response schemas
export const UpdateSegmentRequestSchema = z.object({
	content: z.string().min(1, "Content cannot be empty"),
});

export const UpdateSegmentResponseSchema = z.object({
	success: z.boolean(),
	segment: ContentSegmentSchema.optional(),
	error: z.string().optional(),
});

export const HomePageResponseSchema = z.object({
	success: z.boolean(),
	data: PageContentSchema.optional(),
	error: z.string().optional(),
});

// API response types
export type TUpdateSegmentRequest = z.infer<typeof UpdateSegmentRequestSchema>;
export type TUpdateSegmentResponse = z.infer<
	typeof UpdateSegmentResponseSchema
>;
export type THomePageResponse = z.infer<typeof HomePageResponseSchema>;
