import { Edit3, ExternalLink, Palette, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { ContentSegment } from "@/types/cms";
import { RichTextEditor } from "./rich-text-editor";

interface SegmentEditorProps {
	segment: ContentSegment;
	onChange: (segment: ContentSegment) => void;
	onDelete: () => void;
}

export default function SegmentEditor({
	segment,
	onChange,
	onDelete,
}: SegmentEditorProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleContentChange = (content: string) => {
		onChange({ ...segment, content });
	};

	const handleDataChange = (key: string, value: any) => {
		onChange({
			...segment,
			data: { ...segment.data, [key]: value },
		});
	};

	const getSegmentIcon = () => {
		switch (segment.type) {
			case "highlighted":
				return "🟢";
			case "link":
				return "🔗";
			case "project-card":
				return "📦";
			default:
				return "📝";
		}
	};

	const renderDataEditor = () => {
		switch (segment.type) {
			case "highlighted":
				return (
					<div className="mt-2">
						<label className="block text-xs font-medium text-foreground mb-1">
							Highlight Color (HSL)
						</label>
						<div className="flex items-center space-x-2">
							<Palette className="w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								value={segment.data?.hslColor || "85 100% 75%"}
								onChange={(e) => handleDataChange("hslColor", e.target.value)}
								placeholder="85 100% 75%"
								className="flex-1 px-2 py-1 text-xs border border-input rounded bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent"
							/>
						</div>
					</div>
				);

			case "link":
				return (
					<div className="mt-2">
						<label className="block text-xs font-medium text-foreground mb-1">
							URL
						</label>
						<div className="flex items-center space-x-2">
							<ExternalLink className="w-4 h-4 text-muted-foreground" />
							<input
								type="url"
								value={segment.data?.url || ""}
								onChange={(e) => handleDataChange("url", e.target.value)}
								placeholder="https://example.com"
								className="flex-1 px-2 py-1 text-xs border border-input rounded bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent"
							/>
						</div>
					</div>
				);

			case "project-card":
				return (
					<div className="mt-2 space-y-2">
						<label className="block text-xs font-medium text-foreground">
							Project Data (JSON)
						</label>
						<textarea
							value={JSON.stringify(segment.data?.projectData || {}, null, 2)}
							onChange={(e) => {
								try {
									const projectData = JSON.parse(e.target.value);
									handleDataChange("projectData", projectData);
								} catch {
									// Invalid JSON, don't update
								}
							}}
							rows={4}
							className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent font-mono"
							placeholder='{"title": "Project Name", "description": "Description", "technologies": ["React", "TypeScript"]}'
						/>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="text-base text-foreground leading-relaxed">
			<div className="border border-border rounded-lg p-3 bg-muted/30 hover:border-accent hover:bg-accent/10 transition-colors">
			<div className="flex items-center justify-between mb-2">
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="flex items-center space-x-2 text-xs font-medium text-foreground hover:text-accent"
				>
					<span>{getSegmentIcon()}</span>
					<span className="capitalize">{segment.type}</span>
					{segment.type === "link" && segment.data?.url && (
						<span className="text-accent truncate max-w-20">
							{segment.data.url}
						</span>
					)}
				</button>
				<button
					onClick={onDelete}
					className="p-1 text-muted-foreground hover:text-destructive transition-colors"
				>
					<Trash2 className="w-3 h-3" />
				</button>
			</div>

			<div className="mb-2">
				{segment.type === "project-card" ? (
					<div className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border border-border">
						{segment.content || "{}"}
					</div>
				) : (
					<input
						type="text"
						value={segment.content}
						onChange={(e) => handleContentChange(e.target.value)}
						className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent"
						placeholder="Enter content..."
					/>
				)}
			</div>

			{isExpanded && renderDataEditor()}
			</div>
		</div>
	);
}
