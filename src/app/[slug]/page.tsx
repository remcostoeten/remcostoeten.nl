import { notFound } from "next/navigation";
import { db } from "@/db/db";
import { getPageContent } from "@/lib/cms/repository";
import { CMSPageView } from "@/views/cms-page-view";
import { createCmsFactory } from "@/lib/cms/cms-factory";

type TProps = {
	params: {
		slug: string;
	};
};

export default async function DynamicCMSPage({ params }: TProps) {
	const { slug } = await params;
	
	try {
		const cmsFactory = createCmsFactory();
		const page = await cmsFactory.readPage(slug);
		
		if (!page) {
			notFound();
		}
		
		const pageContent = await getPageContent(db, slug);
		
		return (
			<CMSPageView 
				page={page} 
				content={pageContent} 
			/>
		);
	} catch (error) {
		console.error(`Error loading page ${slug}:`, error);
		notFound();
	}
}

export async function generateStaticParams() {
	return [];
}
