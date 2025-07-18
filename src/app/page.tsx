import { db } from "@/db/db";
import { getHomePageContent } from "@/lib/cms/repository";
import { CMSIndexView } from "@/views/cms-index-view";
import type { TPageContent } from "@/lib/cms/types";

// Fallback content for build-time or when database is not available
const FALLBACK_CONTENT: TPageContent = {
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
	],
};

export default async function HomePage() {
	let homePageContent: TPageContent;

	try {
		// Check if we're in build mode or database is not configured
		if (
			process.env.NODE_ENV === "production" &&
			!process.env.TURSO_DATABASE_URL
		) {
			homePageContent = FALLBACK_CONTENT;
		} else {
			// Fetch content on the server
			homePageContent = await getHomePageContent(db);
		}
	} catch (error) {
		console.error("Failed to fetch home page content during build:", error);
		// Use fallback content if database fetch fails
		homePageContent = FALLBACK_CONTENT;
	}

	return <CMSIndexView initialContent={homePageContent} />;
}
