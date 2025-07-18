import type { TPageContent } from "./types";

/**
 * Fallback content for the home page
 * Used when the database is not available or during build time
 */
export const DEFAULT_HOME_PAGE_CONTENT: TPageContent = {
	blocks: [
		{
			id: 1,
			blockType: "heading",
			order: 1,
			segments: [
				{
					id: 1,
					type: "text",
					content: "Welcome to My Portfolio",
					order: 1,
					href: null,
					target: null,
					className: null,
					style: null,
					metadata: null,
					linkMetadata: null,
				},
			],
		},
		{
			id: 2,
			blockType: "paragraph",
			order: 2,
			segments: [
				{
					id: 2,
					type: "text",
					content:
						"I am a passionate developer with expertise in modern web technologies. My journey in software development has been driven by curiosity and a commitment to creating meaningful digital experiences.",
					order: 1,
					href: null,
					target: null,
					className: null,
					style: null,
					metadata: null,
					linkMetadata: null,
				},
			],
		},
		{
			id: 3,
			blockType: "paragraph",
			order: 3,
			segments: [
				{
					id: 3,
					type: "text",
					content: "Feel free to explore my work and ",
					order: 1,
					href: null,
					target: null,
					className: null,
					style: null,
					metadata: null,
					linkMetadata: null,
				},
				{
					id: 4,
					type: "text",
					content: "get in touch",
					order: 2,
					href: "/contact",
					target: null,
					className: "text-accent hover:underline",
					style: null,
				metadata: JSON.stringify({
					emailText: "contact me",
					additionalText: "or check out my",
					websiteText: "portfolio",
					websiteUrl: "https://remcostoeten.nl",
				}),
				linkMetadata: {
					href: "/contact",
					target: "_self",
					className: "text-accent hover:underline",
				},
				},
				{
					id: 5,
					type: "text",
					content: " if you'd like to collaborate.",
					order: 3,
					href: null,
					target: null,
					className: null,
					style: null,
					metadata: null,
					linkMetadata: null,
				},
			],
		},
		{
			id: 4,
			blockType: "paragraph",
			order: 4,
			segments: [
				{
					id: 6,
					type: "time-widget",
					order: 1,
					href: null,
					target: null,
					className: null,
					style: null,
					metadata: JSON.stringify({
						id: "widget-6",
						timezone: "UTC+1",
						format: "24h",
						showSeconds: true,
					}),
					linkMetadata: null,
					value: {
						id: "widget-6",
						timezone: "UTC+1",
						format: "24h",
						showSeconds: true,
					},
				},
			],
		},
	],
};

/**
 * Minimal fallback content for emergency situations
 * Used as a last resort when even the default content fails
 */
export const MINIMAL_FALLBACK_CONTENT: TPageContent = {
	blocks: [
		{
			id: 1,
			blockType: "heading",
			order: 1,
			segments: [
				{
					id: 1,
					type: "text",
					content: "Welcome",
					order: 1,
					href: null,
					target: null,
					className: null,
					style: null,
					metadata: null,
					linkMetadata: null,
				},
			],
		},
		{
			id: 2,
			blockType: "paragraph",
			order: 2,
			segments: [
				{
					id: 2,
					type: "text",
					content: "This is a portfolio website showcasing web development projects.",
					order: 1,
					href: null,
					target: null,
					className: null,
					style: null,
					metadata: null,
					linkMetadata: null,
				},
			],
		},
	],
};

/**
 * Gets the appropriate fallback content based on the environment
 * @param useMinimal - Whether to use minimal fallback content
 * @returns The fallback content to use
 */
export function getFallbackContent(useMinimal = false): TPageContent {
	return useMinimal ? MINIMAL_FALLBACK_CONTENT : DEFAULT_HOME_PAGE_CONTENT;
}
