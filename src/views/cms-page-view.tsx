"use client";

import { TDbPageWithBlocks } from "@/db/types";
import { renderSegment } from "@/lib/cms/renderSegment";
import { TPageContent } from "@/lib/cms/types";

type TProps = {
	page: TDbPageWithBlocks;
	content: TPageContent;
};

export default function CMSPageView({ page, content }: TProps) {
	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<header className="mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-2">
						{page.title}
					</h1>
					{page.description && (
						<p className="text-lg text-muted-foreground">{page.description}</p>
					)}
				</header>

				<main className="prose prose-neutral dark:prose-invert max-w-none">
					{content.blocks.map(function (block) {
						return (
							<div key={block.id} className="mb-6">
								{block.segments.map(function (segment) {
									const segmentForRender = segment as any;
									return (
										<span key={segment.id} className="inline">
											{renderSegment({
												id: segment.id.toString(),
												type: segment.type as any,
												content: segmentForRender.content || "",
												href: segment.href || undefined,
												target: segment.target || undefined,
												metadata: segment.metadata || undefined,
												value: segmentForRender.value || undefined,
											})}
										</span>
									);
								})}
							</div>
						);
					})}
				</main>
			</div>
		</div>
	);
}
