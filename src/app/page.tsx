import { db } from "@/db/db";
import { getHomePageContent } from "@/lib/cms/repository";
import { getFallbackContent } from "@/lib/cms/fallback-content";
import { CMSIndexView } from "@/views/cms-index-view";
import type { TPageContent } from "@/lib/cms/types";

export default async function HomePage() {
	let homePageContent: TPageContent;

	try {
		// Check if we're in build mode or database is not configured
		if (
			process.env.NODE_ENV === "production" &&
			!process.env.TURSO_DATABASE_URL
		) {
			homePageContent = getFallbackContent();
		} else {
			// Fetch content on the server
			homePageContent = await getHomePageContent(db);
		}
	} catch (error) {
		console.error("Failed to fetch home page content during build:", error);
		// Use fallback content if database fetch fails
		homePageContent = getFallbackContent();
	}

	return <CMSIndexView initialContent={homePageContent} />;
}
