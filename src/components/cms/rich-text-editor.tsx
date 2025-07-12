"use client";

import {
	Bold,
	Highlighter,
	Link as LinkIcon,
	Palette,
	Type,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ContentSegment } from "@/types/cms";

type TProps = {
	initialContent: ContentSegment[];
	onChange: (segments: ContentSegment[]) => void;
	placeholder?: string;
};

type THighlightStyle = {
	hslColor: string;
	backgroundColor: string;
	label: string;
};

const DEFAULT_HIGHLIGHT_STYLES: THighlightStyle[] = [
	{
		hslColor: "var(--highlight-frontend)",
		backgroundColor: "hsl(var(--highlight-frontend) / 0.2)",
		label: "Frontend",
	},
	{
		hslColor: "var(--highlight-product)",
		backgroundColor: "hsl(var(--highlight-product) / 0.2)",
		label: "Product",
	},
	{
		hslColor: "280 100% 70%",
		backgroundColor: "hsl(280 100% 70% / 0.15)",
		label: "Purple",
	},
	{
		hslColor: "200 100% 70%",
		backgroundColor: "hsl(200 100% 70% / 0.15)",
		label: "Blue",
	},
	{
		hslColor: "45 100% 65%",
		backgroundColor: "hsl(45 100% 65% / 0.15)",
		label: "Yellow",
	},
];

function generateId() {
	return `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function convertSegmentsToText(segments: ContentSegment[]): string {
	return segments.map((segment) => segment.content).join("");
}

function convertTextToSegments(text: string): ContentSegment[] {
	if (!text.trim()) {
		return [
			{
				id: generateId(),
				type: "text",
				content: "",
			},
		];
	}

	return [
		{
			id: generateId(),
			type: "text",
			content: text,
		},
	];
}

function insertHighlightInSegments(
	segments: ContentSegment[],
	selectionStart: number,
	selectionEnd: number,
	highlightStyle: THighlightStyle,
): ContentSegment[] {
	const newSegments: ContentSegment[] = [];
	let currentOffset = 0;

	segments.forEach((segment) => {
		const segmentStart = currentOffset;
		const segmentEnd = currentOffset + segment.content.length;

		// Case 1: Segment is completely before the selection
		if (segmentEnd <= selectionStart) {
			newSegments.push(segment);
		}
		// Case 2: Segment is completely after the selection
		else if (segmentStart >= selectionEnd) {
			newSegments.push(segment);
		}
		// Case 3: Segment overlaps with the selection
		else {
			// Part before the selection
			if (segmentStart < selectionStart) {
				newSegments.push({
					...segment,
					id: generateId(),
					content: segment.content.substring(0, selectionStart - segmentStart),
				});
			}

			// Part within the selection (highlighted)
			const highlightContentStart = Math.max(0, selectionStart - segmentStart);
			const highlightContentEnd = Math.min(
				segment.content.length,
				selectionEnd - segmentStart,
			);
			const highlightedContent = segment.content.substring(
				highlightContentStart,
				highlightContentEnd,
			);

			if (highlightedContent.length > 0) {
				newSegments.push({
					id: generateId(),
					type: "highlighted",
					content: highlightedContent,
					data: {
						hslColor: highlightStyle.hslColor,
						backgroundColor: highlightStyle.backgroundColor,
					},
				});
			}

			// Part after the selection
			if (segmentEnd > selectionEnd) {
				newSegments.push({
					...segment,
					id: generateId(),
					content: segment.content.substring(selectionEnd - segmentStart),
				});
			}
		}
		currentOffset = segmentEnd;
	});

	return newSegments;
}

export function RichTextEditor({
	initialContent,
	onChange,
	placeholder = "Start typing...",
}: TProps) {
	const [segments, setSegments] = useState<ContentSegment[]>(initialContent);
	const [showToolbar, setShowToolbar] = useState(false);
	const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
	const [selectedRange, setSelectedRange] = useState<{
		start: number;
		end: number;
	} | null>(null);
	const [customHighlightColor, setCustomHighlightColor] =
		useState("85 100% 75%");
	const [showCustomColorInput, setShowCustomColorInput] = useState(false);

	const editorRef = useRef<HTMLDivElement>(null);
	const toolbarRef = useRef<HTMLDivElement>(null);

	const updateSegments = useCallback(
		(newSegments: ContentSegment[]) => {
			setSegments(newSegments);
			onChange(newSegments);
		},
		[onChange],
	);

	const handleTextChange = useCallback(
		(event: React.FormEvent<HTMLDivElement>) => {
			const text = event.currentTarget.innerText || "";
			const newSegments = convertTextToSegments(text);
			updateSegments(newSegments);
		},
		[updateSegments],
	);

	const handleMouseUp = useCallback(() => {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !editorRef.current) {
			setShowToolbar(false);
			return;
		}

		const range = selection.getRangeAt(0);
		const editorRect = editorRef.current.getBoundingClientRect();
		const rangeRect = range.getBoundingClientRect();

		// Calculate text offsets
		const fullText = convertSegmentsToText(segments);
		const beforeRange = range.cloneRange();
		beforeRange.selectNodeContents(editorRef.current);
		beforeRange.setEnd(range.startContainer, range.startOffset);
		const startOffset = beforeRange.toString().length;

		const endOffset = startOffset + range.toString().length;

		setSelectedRange({ start: startOffset, end: endOffset });
		setToolbarPosition({
			x: rangeRect.left + rangeRect.width / 2 - editorRect.left,
			y: rangeRect.top - editorRect.top - 10,
		});
		setShowToolbar(true);
	}, [segments]);

	const applyHighlight = useCallback(
		(style: THighlightStyle) => {
			if (!selectedRange) return;

			const newSegments = insertHighlightInSegments(
				segments,
				selectedRange.start,
				selectedRange.end,
				style,
			);

			updateSegments(newSegments);
			setShowToolbar(false);

			// Clear selection
			window.getSelection()?.removeAllRanges();
		},
		[segments, selectedRange, updateSegments],
	);

	const applyCustomHighlight = useCallback(() => {
		const customStyle: THighlightStyle = {
			hslColor: customHighlightColor,
			backgroundColor: `hsl(${customHighlightColor} / 0.2)`,
			label: "Custom",
		};
		applyHighlight(customStyle);
		setShowCustomColorInput(false);
	}, [customHighlightColor, applyHighlight]);

	const renderContent = useCallback(() => {
		return segments.map((segment) => {
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
							className="text-accent hover:underline font-medium"
							target="_blank"
							rel="noopener noreferrer"
						>
							{segment.content}
						</a>
					);
				default:
					return <span key={segment.id}>{segment.content}</span>;
			}
		});
	}, [segments]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				toolbarRef.current &&
				!toolbarRef.current.contains(event.target as Node)
			) {
				setShowToolbar(false);
			}
		}

		if (showToolbar) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showToolbar]);

	return (
		<div className="relative">
			<div
				ref={editorRef}
				contentEditable
				suppressContentEditableWarning
				onInput={handleTextChange}
				onMouseUp={handleMouseUp}
				onKeyUp={handleMouseUp}
				className="min-h-[120px] p-4 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
				style={{ lineHeight: "1.6" }}
			>
				{segments.length === 0 ||
				(segments.length === 1 && segments[0].content === "") ? (
					<span className="text-muted-foreground">{placeholder}</span>
				) : (
					renderContent()
				)}
			</div>

			{/* Floating Toolbar */}
			{showToolbar && selectedRange && (
				<div
					ref={toolbarRef}
					className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-2 flex items-center space-x-2"
					style={{
						left: `${toolbarPosition.x}px`,
						top: `${toolbarPosition.y}px`,
						transform: "translateX(-50%)",
					}}
				>
					{/* Preset Highlight Styles */}
					{DEFAULT_HIGHLIGHT_STYLES.map((style) => (
						<button
							key={style.label}
							onClick={() => applyHighlight(style)}
							className="flex items-center px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
							title={`Highlight as ${style.label}`}
							style={{
								backgroundColor: style.backgroundColor,
								color: `hsl(${style.hslColor})`,
							}}
						>
							<Highlighter className="w-3 h-3 mr-1" />
							{style.label}
						</button>
					))}

					{/* Custom Color Toggle */}
					<button
						onClick={() => setShowCustomColorInput(!showCustomColorInput)}
						className="p-1 text-muted-foreground hover:text-accent transition-colors"
						title="Custom highlight color"
					>
						<Palette className="w-4 h-4" />
					</button>

					{/* Custom Color Input */}
					{showCustomColorInput && (
						<div className="flex items-center space-x-2 ml-2 pl-2 border-l border-border">
							<input
								type="text"
								value={customHighlightColor}
								onChange={(e) => setCustomHighlightColor(e.target.value)}
								placeholder="85 100% 75%"
								className="w-24 px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
							/>
							<button
								onClick={applyCustomHighlight}
								className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
							>
								Apply
							</button>
						</div>
					)}
				</div>
			)}

			{/* Content Preview (for debugging) */}
			<details className="mt-4">
				<summary className="text-xs text-muted-foreground cursor-pointer">
					Debug: Segment Data
				</summary>
				<pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
					{JSON.stringify(segments, null, 2)}
				</pre>
			</details>
		</div>
	);
}
