import { z } from "zod";

// Define TypeScript types
export type TContentSegment = {
	id: string;
	type: string;
	content: string;
};

export type TContentBlock = {
	id: string;
	segments: TContentSegment[];
};

export type TPageContent = {
	blocks: TContentBlock[];
};

// Create Zod schemas for runtime validation
export const ContentSegmentSchema = z.object({
	id: z.string(),
	type: z.string(),
	content: z.string(),
});

export const ContentBlockSchema = z.object({
	id: z.string(),
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
