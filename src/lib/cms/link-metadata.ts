import { z } from "zod";

export type TLinkMetadata = {
	href: string;
	target?: "_blank" | "_self" | "_parent" | "_top";
	rel?: string;
	className?: string;
	suffix?: string;
};

export const LinkMetadataSchema = z.object({
	href: z.string().url("Must be a valid URL"),
	target: z
		.enum(["_blank", "_self", "_parent", "_top"])
		.optional()
		.default("_blank"),
	rel: z.string().optional().default("noopener noreferrer"),
	className: z.string().optional().default("external-link"),
	suffix: z.string().optional().default(" ↗"),
});

export function createLinkMetadata(options: {
	href: string;
	target?: "_blank" | "_self" | "_parent" | "_top";
	rel?: string;
	className?: string;
	suffix?: string;
}): TLinkMetadata {
	return LinkMetadataSchema.parse(options);
}

export function parseLinkMetadata(metadata: string): TLinkMetadata {
	try {
		const parsed = JSON.parse(metadata);
		return LinkMetadataSchema.parse(parsed);
	} catch (error) {
		throw new Error(`Invalid link metadata: ${error}`);
	}
}

export function serializeLinkMetadata(metadata: TLinkMetadata): string {
	return JSON.stringify(metadata);
}
