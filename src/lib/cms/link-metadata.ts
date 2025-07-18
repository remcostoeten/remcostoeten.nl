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
	target: z.enum(["_blank", "_self", "_parent", "_top"]).optional(),
	rel: z.string().optional(),
	className: z.string().optional(),
	suffix: z.string().optional(),
});

export function createLinkMetadata(options: {
	href: string;
	target?: "_blank" | "_self" | "_parent" | "_top";
	rel?: string;
	className?: string;
	suffix?: string;
}): TLinkMetadata {
	const defaults = {
		target: "_blank" as const,
		rel: "noopener noreferrer",
		className: "external-link",
		suffix: " ↗",
	};
	
	return LinkMetadataSchema.parse({
		...defaults,
		...options,
	});
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
