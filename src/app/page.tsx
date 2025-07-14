import { CMSIndexView } from "@/views/cms-index-view";
import { getHomePageContent } from "@/lib/cms/repository";
import { db } from "@/db/db";

export default async function HomePage() {
	// Fetch content on the server
	const homePageContent = await getHomePageContent(db);
	
	return <CMSIndexView initialContent={homePageContent} />;
}
