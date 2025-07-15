"use client";

import { renderSegment } from "@/lib/cms/renderSegment";
import { TPageContent } from "@/lib/cms/types";
import { TDbPageWithBlocks } from "@/db/types";

type TProps = {
	page: TDbPageWithBlocks;
	content: TPageContent;
};

export function CMSPageView({ page, content }: TProps) {
	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<header className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">
						{page.title}
					</h1>
					{page.description && (
						<p className="text-lg text-muted-foreground">
							{page.description}
						</p>
					)}
				</header>

				<main className="prose prose-neutral dark:prose-invert max-w-none">
					{content.blocks.map((block) => (
						<div key={block.id} className="mb-6">
							{block.segments.map((segment) => (
								<span key={segment.id} className="inline">
									{renderSegment(segment)}
								</span>
							))}
						</div>
					))}
				</main>
			</div>
		</div>
	);
}
