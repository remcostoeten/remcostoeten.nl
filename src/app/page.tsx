import { db } from "@/db/db";
import { getHomePageContent } from "@/lib/cms/repository";
import { CMSIndexView } from "@/views/cms-index-view";

export default async function HomePage() {
	// Fetch content on the server
	const homePageContent = await getHomePageContent(db);

	return <CMSIndexView initialContent={homePageContent} />;
}
