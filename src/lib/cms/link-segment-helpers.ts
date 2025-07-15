import {
	createLinkMetadata,
	serializeLinkMetadata,
	type TLinkMetadata,
} from "./link-metadata";
import type { TContentSegment } from "./types";

export function createLinkSegment(options: {
	id: number;
	content: string;
	order?: number;
	linkOptions: {
		href: string;
		target?: "_blank" | "_self" | "_parent" | "_top";
		rel?: string;
		className?: string;
		suffix?: string;
	};
}): TContentSegment {
	const linkMetadata = createLinkMetadata(options.linkOptions);
	const serializedMetadata = serializeLinkMetadata(linkMetadata);

	return {
		id: options.id,
		type: "link",
		content: options.content,
		order: options.order || 0,
		href: linkMetadata.href,
		target: linkMetadata.target || "_blank",
		className: linkMetadata.className || "external-link",
		style: null,
		metadata: serializedMetadata,
		linkMetadata: linkMetadata,
	};
}

export function createExternalLinkSegment(options: {
	id: number;
	content: string;
	href: string;
	order?: number;
	customClassName?: string;
	customSuffix?: string;
}): TContentSegment {
	return createLinkSegment({
		id: options.id,
		content: options.content,
		order: options.order,
		linkOptions: {
			href: options.href,
			target: "_blank",
			rel: "noopener noreferrer",
			className: options.customClassName || "external-link",
			suffix: options.customSuffix || " ↗",
		},
	});
}

export function createInternalLinkSegment(options: {
	id: number;
	content: string;
	href: string;
	order?: number;
	customClassName?: string;
}): TContentSegment {
	return createLinkSegment({
		id: options.id,
		content: options.content,
		order: options.order,
		linkOptions: {
			href: options.href,
			target: "_self",
			rel: "",
			className: options.customClassName || "internal-link",
			suffix: "",
		},
	});
}

export function createGitHubLinkSegment(options: {
	id: number;
	content: string;
	href: string;
	order?: number;
}): TContentSegment {
	return createLinkSegment({
		id: options.id,
		content: options.content,
		order: options.order,
		linkOptions: {
			href: options.href,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "github-link text-accent hover:underline font-medium",
			suffix: " →",
		},
	});
}

export function createDocumentationLinkSegment(options: {
	id: number;
	content: string;
	href: string;
	order?: number;
}): TContentSegment {
	return createLinkSegment({
		id: options.id,
		content: options.content,
		order: options.order,
		linkOptions: {
			href: options.href,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "docs-link text-blue-600 hover:underline font-medium",
			suffix: " 📄",
		},
	});
}
