import React from "react";
import { ContentSegment, Page } from "../../types/cms";

interface PagePreviewProps {
	page: Page;
}

export default function PagePreview({ page }: PagePreviewProps) {
	const renderSegment = (segment: ContentSegment) => {
		switch (segment.type) {
			case "highlighted":
				return (
					<span
						key={segment.id}
						className="font-medium"
						style={{ color: `hsl(${segment.data?.hslColor || "85 100% 75%"})` }}
					>
						{segment.content}
					</span>
				);

			case "link":
				return (
					<a
						key={segment.id}
						href={segment.data?.url || "#"}
						className="text-accent hover:text-accent/80 transition-colors"
						target="_blank"
						rel="noopener noreferrer"
					>
						{segment.content}
					</a>
				);

			case "project-card": {
				const projectData = segment.data?.projectData;
				if (!projectData) return null;

				return (
					<div
						key={segment.id}
						className="my-4 p-4 border border-border rounded-lg bg-card"
					>
						<h4 className="font-semibold text-foreground mb-2">
							{projectData.title}
						</h4>
						<p className="text-muted-foreground text-sm mb-3">
							{projectData.description}
						</p>
						{projectData.technologies && (
							<div className="flex flex-wrap gap-2 mb-3">
								{projectData.technologies.map((tech, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-muted text-accent text-xs rounded"
									>
										{tech}
									</span>
								))}
							</div>
						)}
						{(projectData.url || projectData.github) && (
							<div className="flex space-x-3">
								{projectData.url && (
									<a
										href={projectData.url}
										className="text-accent hover:text-accent/80 text-sm"
										target="_blank"
										rel="noopener noreferrer"
									>
										View Project →
									</a>
								)}
								{projectData.github && (
									<a
										href={projectData.github}
										className="text-accent hover:text-accent/80 text-sm"
										target="_blank"
										rel="noopener noreferrer"
									>
										GitHub →
									</a>
								)}
							</div>
						)}
					</div>
				);
			}

			default:
				return <span key={segment.id}>{segment.content}</span>;
		}
	};

	const renderBlock = (block: any) => {
		const content = block.content.map(renderSegment);

		if (block.type === "heading") {
			return (
				<h1
					key={block.id}
					className="text-4xl font-light text-foreground mb-8 leading-tight"
				>
					{content}
				</h1>
			);
		}

		return (
			<p
				key={block.id}
				className="text-lg text-muted-foreground leading-relaxed mb-6"
			>
				{content}
			</p>
		);
	};

	return (
		<div className="h-full overflow-y-auto">
			{/* Preview Header */}
			<div className="bg-card p-4 border-b border-border">
				<div className="flex items-center justify-between">
					<h3 className="text-foreground font-medium">Preview</h3>
					<span className="text-xs text-muted-foreground">/{page.slug}</span>
				</div>
			</div>

			{/* Preview Content */}
			<div className="p-8 bg-background min-h-full">
				<div className="max-w-3xl">
					{page.blocks.sort((a, b) => a.order - b.order).map(renderBlock)}
				</div>
			</div>
		</div>
	);
}
