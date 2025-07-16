import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
	ChevronDown,
	Code,
	Github,
	GripVertical,
	Link,
	Music,
	Plus,
	Repeat,
	Settings,
	Trash2,
	Type,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ContentBlock, ContentSegment } from "@/types/cms";
import InlineEditor from "./inline-editor";

interface InlineBlockProps {
	block: ContentBlock;
	isEditing: boolean;
	editingSegment: string | null;
	onSegmentEdit: (segmentId: string) => void;
	onSegmentSave: (segmentId: string, segment: ContentSegment) => void;
	onSegmentCancel: () => void;
	onBlockChange: (block: ContentBlock) => void;
	onBlockDelete: () => void;
	onAddSegment: (segmentType: ContentSegment["type"]) => void;
}

export default function InlineBlock({
	block,
	isEditing,
	editingSegment,
	onSegmentEdit,
	onSegmentSave,
	onSegmentCancel,
	onBlockChange,
	onBlockDelete,
	onAddSegment,
}: InlineBlockProps) {
	const [showBlockSettings, setShowBlockSettings] = useState(false);
	const [showAddDropdown, setShowAddDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowAddDropdown(false);
			}
		};

		if (showAddDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [showAddDropdown]);

	const handleSegmentSave = (
		segmentId: string,
		updatedSegment: ContentSegment,
	) => {
		const updatedBlock = {
			...block,
			content: block.content.map((seg) =>
				seg.id === segmentId ? updatedSegment : seg,
			),
		};
		onBlockChange(updatedBlock);
		onSegmentSave(segmentId, updatedSegment);
	};

	const handleSegmentSplit = (
		segmentId: string,
		newSegments: ContentSegment[],
	) => {
		const segmentIndex = block.content.findIndex((seg) => seg.id === segmentId);
		if (segmentIndex === -1) return;

		const updatedContent = [
			...block.content.slice(0, segmentIndex),
			...newSegments,
			...block.content.slice(segmentIndex + 1),
		];

		const updatedBlock = {
			...block,
			content: updatedContent,
		};

		onBlockChange(updatedBlock);
		onSegmentCancel(); // Close editing mode
	};

	const handleBlockStylesChange = (styles: ContentBlock['styles']) => {
		onBlockChange({
			...block,
			styles,
		});
	};

	const getBlockClasses = () => {
		// Use consistent typography for both editing and non-editing states
		const baseClasses = "text-base text-foreground leading-relaxed";

		let borderClasses = "";
		if (block.styles?.borderTop) borderClasses += " border-t border-border";
		if (block.styles?.borderBottom) borderClasses += " border-b border-border";
		if (block.styles?.borderLeft) borderClasses += " border-l border-border";
		if (block.styles?.borderRight) borderClasses += " border-r border-border";

		return `${baseClasses} ${borderClasses}`;
	};

	const getBlockStyles = () => {
		return {
			marginTop: block.styles?.marginTop || undefined,
			marginBottom: block.styles?.marginBottom || undefined,
			paddingTop: block.styles?.paddingTop || undefined,
			paddingBottom: block.styles?.paddingBottom || undefined,
		};
	};

	return (
		<LayoutGroup>
			<div className="group relative">
				{/* Block Controls */}
				{isEditing && (
					<div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
						<button
							className="p-1 text-muted-foreground hover:text-accent transition-colors cursor-move"
							title="Drag to reorder"
						>
							<GripVertical className="w-4 h-4" />
						</button>
						<button
							onClick={() => setShowBlockSettings(!showBlockSettings)}
							className="p-1 text-muted-foreground hover:text-accent transition-colors"
							title="Block settings"
						>
							<Settings className="w-4 h-4" />
						</button>
						<button
							onClick={onBlockDelete}
							className="p-1 text-muted-foreground hover:text-destructive transition-colors"
							title="Delete block"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				)}

				{/* Block Content */}
				<div className={getBlockClasses()} style={getBlockStyles()}>
					{block.content.map((segment, index) => (
						<React.Fragment key={segment.id}>
							<InlineEditor
								segment={segment}
								isEditing={isEditing && editingSegment === segment.id}
								onEdit={() => onSegmentEdit(segment.id)}
								onSave={(updatedSegment) =>
									handleSegmentSave(segment.id, updatedSegment)
								}
								onCancel={onSegmentCancel}
								onSplitSegment={(newSegments) =>
									handleSegmentSplit(segment.id, newSegments)
								}
								blockStyles={block.styles}
								onBlockStylesChange={handleBlockStylesChange}
							/>
							{index < block.content.length - 1 && " "}
						</React.Fragment>
					))}

					{/* Add Segment Dropdown */}
					{isEditing && (
						<div className="inline-flex items-center ml-2">
							<div className="relative" ref={dropdownRef}>
								<button
									onClick={() => setShowAddDropdown(!showAddDropdown)}
									className="flex items-center px-2 py-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-accent rounded transition-colors"
									title="Add new segment"
								>
									<Plus className="w-3 h-3 mr-1" />
									Add...
									<ChevronDown
										className={`w-3 h-3 ml-1 transition-transform ${showAddDropdown ? "rotate-180" : ""}`}
									/>
								</button>
								<AnimatePresence>
									{showAddDropdown && (
										<motion.div
											layout
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											className="absolute mt-1 left-0 w-48 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden p-0"
										>
											<div className="py-1">
												<button
													onClick={() => {
														onAddSegment("text");
														setShowAddDropdown(false);
													}}
													className="flex items-center w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
												>
													<Type className="w-4 h-4 mr-3 text-muted-foreground" />{" "}
													Text
												</button>
												<button
													onClick={() => {
														onAddSegment("api-endpoint");
														setShowAddDropdown(false);
													}}
													className="flex items-center w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
												>
													<Code className="w-4 h-4 mr-3 text-muted-foreground" />{" "}
													API Endpoint
												</button>
												<button
													onClick={() => {
														onAddSegment("github-commits");
														setShowAddDropdown(false);
													}}
													className="flex items-center w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
												>
													<Github className="w-4 h-4 mr-3 text-muted-foreground" />{" "}
													GitHub Commits
												</button>
												<button
													onClick={() => {
														onAddSegment("spotify-now-playing");
														setShowAddDropdown(false);
													}}
													className="flex items-center w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
												>
													<Music className="w-4 h-4 mr-3 text-muted-foreground" />{" "}
													Spotify Now Playing
												</button>
												<button
													onClick={() => {
														onAddSegment("link");
														setShowAddDropdown(false);
													}}
													className="flex items-center w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
												>
													<Link className="w-4 h-4 mr-3 text-muted-foreground" />{" "}
													Link
												</button>
												<button
													onClick={() => {
														onAddSegment("project-card");
														setShowAddDropdown(false);
													}}
													className="flex items-center w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
												>
													<Code className="w-4 h-4 mr-3 text-muted-foreground" />{" "}
													Project Card
												</button>
												<button
													onClick={() => {
														onAddSegment("swapping-word-effect");
														setShowAddDropdown(false);
													}}
													className="flex items-center w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors"
												>
													<Repeat className="w-4 h-4 mr-3 text-muted-foreground" />{" "}
													Swapping Words
												</button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					)}
				</div>

				{/* Block Settings Panel */}
				<AnimatePresence>
					{showBlockSettings && isEditing && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className="overflow-hidden absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 z-50 min-w-64"
						>
							<h4 className="text-sm font-medium text-foreground mb-3">
								Block Settings
							</h4>

							<div className="space-y-3">
								{/* Spacing */}
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Spacing
									</label>
									<div className="grid grid-cols-2 gap-2">
										<input
											type="text"
											placeholder="Margin top"
											value={block.styles?.marginTop || ""}
											onChange={(e) =>
												handleBlockStylesChange({
													...block.styles,
													marginTop: e.target.value,
												})
											}
											className="px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										/>
										<input
											type="text"
											placeholder="Margin bottom"
											value={block.styles?.marginBottom || ""}
											onChange={(e) =>
												handleBlockStylesChange({
													...block.styles,
													marginBottom: e.target.value,
												})
											}
											className="px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										/>
									</div>
								</div>

								{/* Borders */}
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Borders
									</label>
									<div className="grid grid-cols-2 gap-2">
										{[
											"borderTop",
											"borderBottom",
											"borderLeft",
											"borderRight",
										].map((border) => (
											<label
												key={border}
												className="flex items-center space-x-2"
											>
												<input
													type="checkbox"
													checked={Boolean(
														block.styles?.[border as keyof typeof block.styles],
													)}
													onChange={(e) =>
														handleBlockStylesChange({
															...block.styles,
															[border]: e.target.checked,
														})
													}
													className="rounded border-input"
												/>
												<span className="text-xs text-foreground capitalize">
													{border.replace("border", "")}
												</span>
											</label>
										))}
									</div>
								</div>
							</div>

							<div className="flex justify-end mt-4">
								<button
									onClick={() => setShowBlockSettings(false)}
									className="px-3 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
								>
									Done
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</LayoutGroup>
	);
}
