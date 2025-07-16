import { ArrowLeft, Edit3, Eye } from "lucide-react";
import React, { useState } from "react";
import { APIEndpoint, SpotifyNowPlaying } from "@/components/api";
import { ContentBlock, ContentSegment, Page } from "@/types/cms";

type TProps = {
	page: Page;
	onBack: () => void;
	onEdit: () => void;
};

function renderSegment(segment: ContentSegment) {
	switch (segment.type) {
		case "highlighted":
			return (
				<span
					key={segment.id}
					className="font-medium px-1 py-0.5 rounded"
					style={{
						backgroundColor:
							segment.data?.backgroundColor ||
							"hsl(var(--highlight-frontend) / 0.2)",
						color: segment.data?.hslColor
							? `hsl(${segment.data.hslColor})`
							: "hsl(var(--highlight-frontend))",
						padding: segment.data?.padding || "0.125rem 0.25rem",
						borderRadius: segment.data?.borderRadius || "0.25rem",
					}}
				>
					{segment.content}
				</span>
			);

		case "link":
			return (
				<a
					key={segment.id}
					href={segment.data?.url || "#"}
					target="_blank"
					rel="noopener noreferrer"
					className="text-accent hover:underline font-medium"
					style={{
						fontWeight: segment.data?.fontWeight || "medium",
						fontSize: segment.data?.fontSize
							? `var(--font-size-${segment.data.fontSize})`
							: "inherit",
					}}
				>
					{segment.content} ↗
				</a>
			);

		case "project-card":
			// For now, we'll render project cards as simple text
			// You can expand this later to match the ProjectCard component
			return (
				<span
					key={segment.id}
					className="font-medium px-1 py-0.5 rounded"
					style={{
						backgroundColor: "hsl(var(--highlight-product) / 0.2)",
						color: "hsl(var(--highlight-product))",
					}}
				>
					{segment.content}
				</span>
			);

		case "spotify-now-playing":
			return (
				<span key={segment.id}>
					<SpotifyNowPlaying />
				</span>
			);

		case "api-endpoint":
			return (
				<span key={segment.id}>
					<APIEndpoint
						endpointUrl={segment.data?.endpointUrl || ""}
						refreshInterval={segment.data?.refreshInterval}
					/>
				</span>
			);

		default:
			return (
				<span
					key={segment.id}
					style={{
						fontWeight: segment.data?.fontWeight || "normal",
						fontSize: segment.data?.fontSize
							? `var(--font-size-${segment.data.fontSize})`
							: "inherit",
					}}
				>
					{segment.content}
				</span>
			);
	}
}

function renderBlock(block: ContentBlock) {
	const content = block.content.map(renderSegment);
	const blockStyles = {
		marginTop: block.styles?.marginTop || undefined,
		marginBottom: block.styles?.marginBottom || undefined,
		paddingTop: block.styles?.paddingTop || undefined,
		paddingBottom: block.styles?.paddingBottom || undefined,
	};

	let borderClasses = "";
	if (block.styles?.borderTop) borderClasses += " border-t border-border";
	if (block.styles?.borderBottom) borderClasses += " border-b border-border";
	if (block.styles?.borderLeft) borderClasses += " border-l border-border";
	if (block.styles?.borderRight) borderClasses += " border-r border-border";

	if (block.type === "heading") {
		return (
			<h1
				key={block.id}
				className={`text-xl font-medium text-foreground${borderClasses}`}
				style={blockStyles}
			>
				{content}
			</h1>
		);
	}

	return (
		<p
			key={block.id}
			className={`text-foreground leading-relaxed text-base${borderClasses}`}
			style={blockStyles}
		>
			{content}
		</p>
	);
}

export default function LivePageRenderer({ page, onBack, onEdit }: TProps) {
	const [showPreview, setShowPreview] = useState(false);

	return (
		<>
			<div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
				{/* Floating Edit Controls */}
				<div className="fixed top-4 left-4 z-50 flex items-center space-x-2">
					<button
						onClick={onBack}
						className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors shadow-lg"
						title="Back to pages"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
					<button
						onClick={onEdit}
						className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 shadow-lg"
					>
						<Edit3 className="w-4 h-4" />
						Edit
					</button>
					<button
						onClick={() => setShowPreview(true)}
						className="px-4 py-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 shadow-lg"
					>
						<Eye className="w-4 h-4" />
						Preview
					</button>
				</div>

				{/* Live Page Content */}
				<div className="max-w-2xl w-full space-y-8">
					{page.blocks.sort((a, b) => a.order - b.order).map(renderBlock)}
				</div>
			</div>

			{/* Preview Modal */}
			{showPreview && (
				<div
					className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
					onClick={() => setShowPreview(false)}
				>
					<div
						className="bg-popover text-popover-foreground rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] overflow-y-auto backdrop-blur-lg border border-border"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-6">
							<h2 className="text-2xl font-bold mb-4">{page.title}</h2>
							<div className="space-y-8">
								{page.blocks.sort((a, b) => a.order - b.order).map(renderBlock)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
