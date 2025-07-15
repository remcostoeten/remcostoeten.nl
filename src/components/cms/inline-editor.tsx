import {
	Bold,
	ListOrdered as BorderAll,
	ExternalLink,
	Italic,
	Link,
	Minus,
	Palette,
	Plus,
	Type,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { BlockStyles, ContentSegment } from "@/types/cms";

interface InlineEditorProps {
	segment: ContentSegment;
	isEditing: boolean;
	onEdit: () => void;
	onSave: (segment: ContentSegment) => void;
	onCancel: () => void;
	onSplitSegment?: (newSegments: ContentSegment[]) => void;
	blockStyles?: BlockStyles;
	onBlockStylesChange?: (styles: BlockStyles) => void;
}

export default function InlineEditor({
	segment,
	isEditing,
	onEdit,
	onSave,
	onCancel,
	onSplitSegment,
	blockStyles,
	onBlockStylesChange,
}: InlineEditorProps) {
	const [editingSegment, setEditingSegment] = useState<ContentSegment>(segment);
	const [showStylePanel, setShowStylePanel] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	const handleSave = () => {
		onSave(editingSegment);
		setShowStylePanel(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			onCancel();
		}
	};

	const updateSegmentData = (key: string, value: any) => {
		setEditingSegment((prev) => ({
			...prev,
			data: { ...prev.data, [key]: value },
		}));
	};

	const updateBlockStyles = (key: keyof BlockStyles, value: any) => {
		if (onBlockStylesChange) {
			onBlockStylesChange({
				...blockStyles,
				[key]: value,
			});
		}
	};

	const applyQuickHighlight = (hslColor: string, backgroundColor: string) => {
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed && selection.toString().trim()) {
			// Handle partial selection
			applyStyleToSelection("highlighted", { hslColor, backgroundColor });
		} else {
			// Apply to entire segment
			setEditingSegment((prev) => ({
				...prev,
				type: "highlighted",
				data: {
					...prev.data,
					hslColor,
					backgroundColor,
				},
			}));
		}
	};

	const applyStyleToSelection = (type: ContentSegment["type"], data: any) => {
		if (!inputRef.current) return;

		const input = inputRef.current;
		const selectionStart = input.selectionStart || 0;
		const selectionEnd = input.selectionEnd || 0;

		if (selectionStart === selectionEnd) return; // No selection

		const fullText = input.value;
		const selectedText = fullText.substring(selectionStart, selectionEnd);

		if (!selectedText.trim()) return;

		// Calculate actual text positions
		const beforeText = fullText.substring(0, selectionStart);
		const selectedPart = selectedText;
		const afterText = fullText.substring(selectionEnd);

		// Create an array of new segments
		const newSegments: ContentSegment[] = [];

		// Before text (keep original segment type)
		if (beforeText) {
			newSegments.push({
				id: `seg-${Date.now()}-before`,
				type: editingSegment.type,
				content: beforeText,
				data: editingSegment.data,
			});
		}

		// Selected text (new type)
		newSegments.push({
			id: `seg-${Date.now()}-selected`,
			type,
			content: selectedPart,
			data,
		});

		// After text (keep original segment type)
		if (afterText) {
			newSegments.push({
				id: `seg-${Date.now()}-after`,
				type: editingSegment.type,
				content: afterText,
				data: editingSegment.data,
			});
		}

		// Notify parent about segment splitting
		if (onSplitSegment) {
			onSplitSegment(newSegments);
		}

		setShowStylePanel(false);
	};

	const renderSegmentContent = () => {
		const baseClasses = "transition-all duration-200";

		switch (segment.type) {
			case "highlighted":
				return (
					<span
						className={`${baseClasses} font-medium px-1 py-0.5 rounded`}
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
					<span
						className={`${baseClasses} text-accent hover:underline font-medium cursor-pointer`}
						style={{
							fontWeight: segment.data?.fontWeight || "medium",
							fontSize: segment.data?.fontSize
								? `var(--font-size-${segment.data.fontSize})`
								: "inherit",
						}}
						title={`Link to: ${segment.data?.url || "#"} (Click to edit)`}
					>
						{segment.content} ↗
					</span>
				);

			case "project-card":
				return (
					<span
						className={`${baseClasses} font-medium px-1 py-0.5 rounded`}
						style={{
							backgroundColor: "hsl(var(--highlight-product) / 0.2)",
							color: "hsl(var(--highlight-product))",
						}}
					>
						{segment.content}
					</span>
				);

			default:
				return (
					<span
						className={baseClasses}
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
	};

	if (!isEditing) {
		return (
			<span
				onClick={onEdit}
				className="text-base text-foreground leading-relaxed cursor-pointer hover:bg-accent/10 rounded px-1 -mx-1 transition-colors"
				title="Click to edit"
			>
				{renderSegmentContent()}
			</span>
		);
	}

	return (
		<div className="relative inline-block text-base text-foreground leading-relaxed">
			{/* Rich Text Input */}
			<div className="inline-flex items-center gap-2">
				<input
					ref={inputRef}
					type="text"
					value={editingSegment.content}
					onChange={(e) => {
						setEditingSegment((prev) => ({ ...prev, content: e.target.value }));
					}}
					onKeyDown={handleKeyDown}
					onBlur={(e) => {
						// Only save if we're not clicking inside the style panel
						const relatedTarget = e.relatedTarget as HTMLElement;
						if (!relatedTarget || !relatedTarget.closest(".style-panel")) {
							handleSave();
						}
					}}
					onMouseUp={() => {
						if (inputRef.current) {
							const input = inputRef.current;
							const selectionStart = input.selectionStart || 0;
							const selectionEnd = input.selectionEnd || 0;

							if (selectionStart !== selectionEnd) {
								setShowStylePanel(true);
							}
						}
					}}
					className="bg-background border border-accent rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 min-w-[100px]"
					style={{
						minHeight: "1.5rem",
						width: `${Math.max(editingSegment.content.length + 2, 10)}ch`,
					}}
				/>

				<button
					onClick={() => setShowStylePanel(!showStylePanel)}
					className="p-1 text-muted-foreground hover:text-accent transition-colors"
					title="Style options"
				>
					<Palette className="w-4 h-4" />
				</button>
			</div>

			{/* Style Panel */}
			{showStylePanel && (
				<div className="style-panel absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 z-50 min-w-80">
					<div className="space-y-4">
						{/* Quick Highlight Buttons */}
						<div>
							<label className="block text-xs font-medium text-foreground mb-2">
								Quick Highlights
							</label>
							<div className="flex gap-2 flex-wrap">
								<button
									onClick={() =>
										applyQuickHighlight(
											"var(--highlight-frontend)",
											"hsl(var(--highlight-frontend) / 0.2)",
										)
									}
									className="px-2 py-1 text-xs rounded transition-colors font-medium"
									style={{
										backgroundColor: "hsl(var(--highlight-frontend) / 0.2)",
										color: "hsl(var(--highlight-frontend))",
									}}
								>
									Frontend
								</button>
								<button
									onClick={() =>
										applyQuickHighlight(
											"var(--highlight-product)",
											"hsl(var(--highlight-product) / 0.2)",
										)
									}
									className="px-2 py-1 text-xs rounded transition-colors font-medium"
									style={{
										backgroundColor: "hsl(var(--highlight-product) / 0.2)",
										color: "hsl(var(--highlight-product))",
									}}
								>
									Product
								</button>
								<button
									onClick={() =>
										applyQuickHighlight(
											"280 100% 70%",
											"hsl(280 100% 70% / 0.15)",
										)
									}
									className="px-2 py-1 text-xs rounded transition-colors font-medium"
									style={{
										backgroundColor: "hsl(280 100% 70% / 0.15)",
										color: "hsl(280 100% 70%)",
									}}
								>
									Purple
								</button>
								<button
									onClick={() =>
										applyQuickHighlight(
											"200 100% 70%",
											"hsl(200 100% 70% / 0.15)",
										)
									}
									className="px-2 py-1 text-xs rounded transition-colors font-medium"
									style={{
										backgroundColor: "hsl(200 100% 70% / 0.15)",
										color: "hsl(200 100% 70%)",
									}}
								>
									Blue
								</button>
								<button
									onClick={() =>
										applyQuickHighlight(
											"45 100% 65%",
											"hsl(45 100% 65% / 0.15)",
										)
									}
									className="px-2 py-1 text-xs rounded transition-colors font-medium"
									style={{
										backgroundColor: "hsl(45 100% 65% / 0.15)",
										color: "hsl(45 100% 65%)",
									}}
								>
									Yellow
								</button>
							</div>
						</div>

						{/* Segment Type */}
						<div>
							<label className="block text-xs font-medium text-foreground mb-2">
								Type
							</label>
							<div className="flex gap-2">
								{[
									"text",
									"highlighted",
									"link",
									"github-commits",
									"spotify-now-playing",
									"api-endpoint",
								].map((type) => (
									<button
										key={type}
										onClick={() => {
											setEditingSegment((prev) => ({
												...prev,
												type: type as any,
												data:
													type === "highlighted"
														? {
																hslColor: "85 100% 75%",
																backgroundColor: "hsl(85 100% 75% / 0.2)",
																...prev.data,
															}
														: type === "link"
															? { url: "", ...prev.data }
															: type === "github-commits"
																? {
																		repo: "remco-stoeten/remcostoeten.nl",
																		...prev.data,
																	}
																: type === "api-endpoint"
																	? {
																			endpointUrl: "",
																			refreshInterval: 60000,
																			...prev.data,
																		}
																	: type === "spotify-now-playing"
																		? {
																				endpointUrl: "/api/spotify/now-playing",
																				refreshInterval: 30000,
																				...prev.data,
																			}
																		: prev.data,
											}));
										}}
										className={`px-3 py-1 text-xs rounded transition-colors ${
											editingSegment.type === type
												? "bg-accent text-accent-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{type}
									</button>
								))}
							</div>
						</div>

						{/* Color for highlighted text */}
						{editingSegment.type === "highlighted" && (
							<div>
								<label className="block text-xs font-medium text-foreground mb-2">
									Highlight Color (HSL)
								</label>
								<input
									type="text"
									value={editingSegment.data?.hslColor || "85 100% 75%"}
									onChange={(e) =>
										updateSegmentData("hslColor", e.target.value)
									}
									className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
									placeholder="85 100% 75%"
								/>
								<div className="mt-2">
									<label className="block text-xs font-medium text-foreground mb-1">
										Background
									</label>
									<input
										type="text"
										value={editingSegment.data?.backgroundColor || ""}
										onChange={(e) =>
											updateSegmentData("backgroundColor", e.target.value)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="rgba(133, 255, 193, 0.1)"
									/>
								</div>
							</div>
						)}

						{/* URL for links */}
						{editingSegment.type === "link" && (
							<div>
								<label className="block text-xs font-medium text-foreground mb-2">
									URL
								</label>
								<input
									type="url"
									value={editingSegment.data?.url || ""}
									onChange={(e) => updateSegmentData("url", e.target.value)}
									className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
									placeholder="https://example.com"
								/>
							</div>
						)}

						{/* Repository for github-commits */}
						{editingSegment.type === "github-commits" && (
							<div className="space-y-3">
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Repository
									</label>
									<input
										type="text"
										value={
											editingSegment.data?.repo ||
											"remco-stoeten/remcostoeten.nl"
										}
										onChange={(e) => updateSegmentData("repo", e.target.value)}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="owner/repository"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Refresh Interval (ms)
									</label>
									<input
										type="number"
										value={editingSegment.data?.refreshInterval || 60000}
										onChange={(e) =>
											updateSegmentData(
												"refreshInterval",
												parseInt(e.target.value),
											)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="60000"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Template (optional)
									</label>
									<textarea
										value={editingSegment.data?.template || ""}
										onChange={(e) =>
											updateSegmentData("template", e.target.value)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="Template string"
									/>
								</div>
								<button
									onClick={() =>
										alert("Preview Mode: GitHub Commits - Not yet implemented")
									}
									className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
								>
									Preview
								</button>
							</div>
						)}

						{/* API Endpoint configuration */}
						{editingSegment.type === "api-endpoint" && (
							<div className="space-y-3">
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Endpoint URL
									</label>
									<input
										type="url"
										value={editingSegment.data?.endpointUrl || ""}
										onChange={(e) =>
											updateSegmentData("endpointUrl", e.target.value)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="/api/your-endpoint"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Refresh Interval (ms)
									</label>
									<input
										type="number"
										value={editingSegment.data?.refreshInterval || 60000}
										onChange={(e) =>
											updateSegmentData(
												"refreshInterval",
												parseInt(e.target.value),
											)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="60000"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Template (optional)
									</label>
									<textarea
										value={editingSegment.data?.template || ""}
										onChange={(e) =>
											updateSegmentData("template", e.target.value)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="Template string"
									/>
								</div>
								<button
									onClick={() => alert("Preview Mode: Not yet implemented")}
									className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
								>
									Preview
								</button>
							</div>
						)}

						{/* Spotify Now Playing configuration */}
						{editingSegment.type === "spotify-now-playing" && (
							<div className="space-y-3">
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Spotify API Endpoint
									</label>
									<input
										type="url"
										value={
											editingSegment.data?.endpointUrl ||
											"/api/spotify/now-playing"
										}
										onChange={(e) =>
											updateSegmentData("endpointUrl", e.target.value)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="/api/spotify/now-playing"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Refresh Interval (ms)
									</label>
									<input
										type="number"
										value={editingSegment.data?.refreshInterval || 30000}
										onChange={(e) =>
											updateSegmentData(
												"refreshInterval",
												parseInt(e.target.value),
											)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="30000"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-foreground mb-2">
										Template (optional)
									</label>
									<textarea
										value={editingSegment.data?.template || ""}
										onChange={(e) =>
											updateSegmentData("template", e.target.value)
										}
										className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
										placeholder="Template string"
									/>
								</div>
								<button
									onClick={() =>
										alert(
											"Preview Mode: Spotify Now Playing - Not yet implemented",
										)
									}
									className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
								>
									Preview
								</button>
							</div>
						)}

						{/* Font Weight */}
						<div>
							<label className="block text-xs font-medium text-foreground mb-2">
								Font Weight
							</label>
							<select
								value={editingSegment.data?.fontWeight || "normal"}
								onChange={(e) =>
									updateSegmentData("fontWeight", e.target.value)
								}
								className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
							>
								<option value="normal">Normal</option>
								<option value="medium">Medium</option>
								<option value="semibold">Semibold</option>
								<option value="bold">Bold</option>
							</select>
						</div>

						{/* Block Borders (if block styles are available) */}
						{onBlockStylesChange && (
							<div>
								<label className="block text-xs font-medium text-foreground mb-2">
									Block Borders
								</label>
								<div className="grid grid-cols-2 gap-2">
									{[
										"borderTop",
										"borderBottom",
										"borderLeft",
										"borderRight",
									].map((border) => (
										<label key={border} className="flex items-center space-x-2">
											<input
												type="checkbox"
												checked={Boolean(
													blockStyles?.[border as keyof BlockStyles],
												)}
												onChange={(e) =>
													updateBlockStyles(
														border as keyof BlockStyles,
														e.target.checked,
													)
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
						)}

						{/* Actions */}
						<div className="flex justify-end gap-2 pt-2 border-t border-border">
							<button
								onClick={() => setShowStylePanel(false)}
								className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
							>
								Close
							</button>
							<button
								onClick={handleSave}
								className="px-3 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
							>
								Apply
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
