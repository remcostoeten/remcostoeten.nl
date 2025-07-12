import { AnimatePresence, motion } from "framer-motion";
import {
	Highlighter as Highlight,
	Link,
	Package,
	Plus,
	Trash2,
	Type,
} from "lucide-react";
import React, { useState } from "react";
import { ContentBlock, ContentSegment } from "@/types/cms";
import SegmentEditor from "./SegmentEditor";

interface BlockEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
	onDelete: () => void;
}

export default function BlockEditor({
	block,
	onChange,
	onDelete,
}: BlockEditorProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const handleSegmentChange = (
		segmentId: string,
		updatedSegment: ContentSegment,
	) => {
		onChange({
			...block,
			content: block.content.map((segment) =>
				segment.id === segmentId ? updatedSegment : segment,
			),
		});
	};

	const handleAddSegment = (type: ContentSegment["type"]) => {
		const newSegment: ContentSegment = {
			id: `seg-${Date.now()}`,
			type,
			content: type === "project-card" ? "{}" : "New content",
			data:
				type === "highlighted"
					? { hslColor: "85 100% 75%" }
					: type === "link"
						? { url: "#" }
						: type === "project-card"
							? {
									projectData: { title: "", description: "", technologies: [] },
								}
							: undefined,
		};

		onChange({
			...block,
			content: [...block.content, newSegment],
		});
	};

	const handleDeleteSegment = (segmentId: string) => {
		onChange({
			...block,
			content: block.content.filter((segment) => segment.id !== segmentId),
		});
	};

	const segmentTypes = [
		{ type: "text" as const, icon: Type, label: "Text" },
		{ type: "highlighted" as const, icon: Highlight, label: "Highlight" },
		{ type: "link" as const, icon: Link, label: "Link" },
		{ type: "project-card" as const, icon: Package, label: "Project Card" },
	];

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-2">
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="text-sm font-medium text-foreground hover:text-accent"
					>
						{block.type === "heading" ? "📝 Heading" : "📄 Paragraph"}
					</button>
					<span className="text-xs text-muted-foreground">
						{block.content.length} segment
						{block.content.length !== 1 ? "s" : ""}
					</span>
				</div>
				<button
					onClick={onDelete}
					className="p-1 text-muted-foreground hover:text-destructive transition-colors"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="overflow-hidden"
					>
						<div className="space-y-3 mb-4">
							{block.content.map((segment) => (
								<SegmentEditor
									key={segment.id}
									segment={segment}
									onChange={(updatedSegment) =>
										handleSegmentChange(segment.id, updatedSegment)
									}
									onDelete={() => handleDeleteSegment(segment.id)}
								/>
							))}
						</div>

						<div className="border-t border-border pt-3">
							<div className="flex flex-wrap gap-2">
								{segmentTypes.map(({ type, icon: Icon, label }) => (
									<button
										key={type}
										onClick={() => handleAddSegment(type)}
										className="flex items-center px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
									>
										<Icon className="w-3 h-3 mr-1" />
										{label}
									</button>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
