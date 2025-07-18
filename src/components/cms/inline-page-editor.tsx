import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	Check,
	Clock,
	Edit3,
	Eye,
	FileText,
	Save,
	Settings,
	Type,
} from "lucide-react";
import React, { useState } from "react";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";
import { ContentBlock, ContentSegment, Page } from "@/types/cms";
import { generateSlug } from "@/utils/cms-data";
import InlineBlock from "./inline-block";
import LivePageRenderer from "./live-page-renderer";

interface InlinePageEditorProps {
	page: Page;
	onSave: (page: Page) => void;
	onBack: () => void;
}

export default function InlinePageEditor({
	page,
	onSave,
	onBack,
}: InlinePageEditorProps) {
	const [editingPage, setEditingPage] = useState<Page>(page);
	const [isEditing, setIsEditing] = useState(false);
	const [editingSegment, setEditingSegment] = useState<string | null>(null);
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showMetadata, setShowMetadata] = useState(false);

	const handleToggleEdit = () => {
		setIsEditing(!isEditing);
		setEditingSegment(null);
	};

	const handleSave = async () => {
		setSaveStatus("saving");
		setHasUnsavedChanges(false);

		// Simulate save delay for better UX feedback
		await new Promise((resolve) => setTimeout(resolve, 500));

		onSave(editingPage);
		setSaveStatus("saved");

		// Reset save status after 2 seconds
		setTimeout(() => {
			setSaveStatus("idle");
		}, 2000);

		setIsEditing(false);
		setEditingSegment(null);
	};

	const handleBlockChange = (blockId: string, updatedBlock: ContentBlock) => {
		setEditingPage((prev) => ({
			...prev,
			blocks: prev.blocks.map((block) =>
				block.id === blockId ? updatedBlock : block,
			),
			updatedAt: new Date(),
		}));
		setHasUnsavedChanges(true);
		setSaveStatus("idle");
	};

	const handleAddBlock = (type: "heading" | "paragraph") => {
		const newBlock: ContentBlock = {
			id: `block-${Date.now()}`,
			type,
			order: editingPage.blocks.length,
			content: [
				{
					id: `seg-${Date.now()}`,
					type: "text",
					content:
						type === "heading" ? "New Heading" : "New paragraph content.",
				},
			],
		};

		setEditingPage((prev) => ({
			...prev,
			blocks: [...prev.blocks, newBlock],
			updatedAt: new Date(),
		}));
		setHasUnsavedChanges(true);
		setSaveStatus("idle");
	};

	const handleDeleteBlock = (blockId: string) => {
		if (confirm("Are you sure you want to delete this block?")) {
			setEditingPage((prev) => ({
				...prev,
				blocks: prev.blocks.filter((block) => block.id !== blockId),
				updatedAt: new Date(),
			}));
			setHasUnsavedChanges(true);
			setSaveStatus("idle");
		}
	};

	const handleAddSegment = (
		blockId: string,
		segmentType: ContentSegment["type"],
	) => {
		const newSegment: ContentSegment = {
			id: `seg-${Date.now()}`,
			type: segmentType,
			content: segmentType === "text" ? "new text" : "",
			data:
				segmentType === "api-endpoint"
					? { endpointUrl: "https://api.example.com" }
					: false
						? {}
						: segmentType === "spotify-now-playing"
							? {}
							: undefined,
		};

		setEditingPage((prev) => ({
			...prev,
			blocks: prev.blocks.map((block) =>
				block.id === blockId
					? { ...block, content: [...block.content, newSegment] }
					: block,
			),
			updatedAt: new Date(),
		}));
		setHasUnsavedChanges(true);
		setSaveStatus("idle");
		setEditingSegment(newSegment.id);
	};

	const handleSegmentEdit = (segmentId: string) => {
		setEditingSegment(segmentId);
	};

	const handleSegmentSave = (segmentId: string, segment: ContentSegment) => {
		// Update the editing page with the new segment data
		setEditingPage((prev) => ({
			...prev,
			blocks: prev.blocks.map((block) => ({
				...block,
				content: block.content.map((seg) =>
					seg.id === segmentId ? segment : seg,
				),
			})),
			updatedAt: new Date(),
		}));
		setHasUnsavedChanges(true);
		setSaveStatus("idle");
		setEditingSegment(null);
	};

	const handleSegmentCancel = () => {
		setEditingSegment(null);
	};

	const handleTitleChange = (newTitle: string) => {
		const newSlug = page.slug === "home" ? "home" : generateSlug(newTitle);
		setEditingPage((prev) => ({
			...prev,
			title: newTitle,
			slug: newSlug,
			updatedAt: new Date(),
		}));
		setHasUnsavedChanges(true);
		setSaveStatus("idle");
	};

	const handleDescriptionChange = (newDescription: string) => {
		setEditingPage((prev) => ({
			...prev,
			description: newDescription,
			updatedAt: new Date(),
		}));
		setHasUnsavedChanges(true);
		setSaveStatus("idle");
	};

	const handleSlugChange = (newSlug: string) => {
		// Don't allow changing the home page slug
		if (page.slug === "home") return;

		const cleanSlug = newSlug
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9-]/g, "")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		setEditingPage((prev) => ({
			...prev,
			slug: cleanSlug,
			updatedAt: new Date(),
		}));
		setHasUnsavedChanges(true);
		setSaveStatus("idle");
	};

	// Keyboard shortcuts for editor
	useKeyboardShortcuts(
		{
			"capslock+s": () => {
				if (isEditing && hasUnsavedChanges) {
					handleSave();
				}
			},
			"capslock+z": () => {
				// Revert logic here
			},
		},
		[isEditing, hasUnsavedChanges, handleSave],
	);

	if (!isEditing) {
		return (
			<LivePageRenderer
				page={editingPage}
				onBack={onBack}
				onEdit={() => setIsEditing(true)}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 bg-popover text-popover-foreground backdrop-blur-lg border-b border-border shadow-2xl z-40">
				<div className="max-w-4xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<button
								onClick={onBack}
								className="flex items-center gap-2 px-4 py-2 h-10 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted border border-border"
								title="Back to pages"
							>
								<ArrowLeft className="w-4 h-4" />
								Back
							</button>
							<div className="flex flex-col">
								<div className="flex items-center gap-4">
									<h1 className="text-xl font-semibold text-foreground">
										{editingPage.title}
									</h1>
									{hasUnsavedChanges && (
										<span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full flex items-center gap-1">
											<Clock className="w-3 h-3" />
											Unsaved
										</span>
									)}
									{saveStatus === "saved" && (
										<span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full flex items-center gap-1">
											<Check className="w-3 h-3" />
											Saved
										</span>
									)}
								</div>
								<div className="flex items-center gap-3 text-sm">
									<span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md border border-border font-mono text-xs">
										/{editingPage.slug}
									</span>
									<span className="text-border">•</span>
									<span className="text-muted-foreground flex items-center gap-1">
										<Clock className="w-3.5 h-3.5" />
										{editingPage.updatedAt.toLocaleString()}
									</span>
								</div>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							{isEditing && (
								<button
									onClick={() => setShowMetadata(!showMetadata)}
									className={`px-4 py-2 h-10 rounded-lg transition-colors flex items-center gap-2 border ${
										showMetadata
											? "bg-secondary text-secondary-foreground border-border"
											: "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
									}`}
								>
									<Settings className="w-4 h-4" />
									Settings
								</button>
							)}

							<button
								onClick={handleToggleEdit}
								className={`px-4 py-2 h-10 rounded-lg transition-colors flex items-center gap-2 border ${
									isEditing
										? "bg-secondary text-secondary-foreground border-border"
										: "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
								}`}
							>
								{isEditing ? (
									<Eye className="w-4 h-4" />
								) : (
									<Edit3 className="w-4 h-4" />
								)}
								{isEditing ? "Preview" : "Edit"}
							</button>

							{isEditing && (
								<button
									onClick={handleSave}
									disabled={saveStatus === "saving"}
									className={`px-4 py-2 h-10 rounded-lg transition-colors flex items-center gap-2 border ${
										saveStatus === "saving"
											? "bg-muted text-muted-foreground cursor-not-allowed border-border"
											: saveStatus === "saved"
												? "bg-green-600 text-white border-green-600"
												: hasUnsavedChanges
													? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
													: "bg-muted text-muted-foreground border-border"
									}`}
								>
									{saveStatus === "saving" ? (
										<>
											<div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
											Saving...
										</>
									) : saveStatus === "saved" ? (
										<>
											<Check className="w-4 h-4" />
											Saved
										</>
									) : (
										<>
											<Save className="w-4 h-4" />
											{hasUnsavedChanges ? "Save Changes" : "Save"}
										</>
									)}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Page Metadata */}
			<AnimatePresence>
				{isEditing && showMetadata && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="overflow-hidden"
					>
						<div className="bg-card border-b border-border">
							<div className="max-w-4xl mx-auto px-6 py-6">
								<h3 className="text-lg font-semibold text-foreground mb-4">
									Page Settings
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-foreground mb-2">
											Page Title
										</label>
										<input
											type="text"
											value={editingPage.title}
											onChange={(e) => handleTitleChange(e.target.value)}
											className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
											placeholder="Enter page title"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-foreground mb-2">
											URL Slug{" "}
											{editingPage.slug === "home" &&
												"(Cannot be changed for home page)"}
										</label>
										<div className="flex items-center">
											<span className="text-sm text-muted-foreground mr-1">
												/
											</span>
											<input
												type="text"
												value={editingPage.slug}
												onChange={(e) => handleSlugChange(e.target.value)}
												disabled={editingPage.slug === "home"}
												className={`flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
													editingPage.slug === "home"
														? "opacity-50 cursor-not-allowed"
														: ""
												}`}
												placeholder="page-url"
											/>
										</div>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-foreground mb-2">
											Description
										</label>
										<textarea
											value={editingPage.description}
											onChange={(e) => handleDescriptionChange(e.target.value)}
											className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
											placeholder="Brief description of the page"
											rows={2}
										/>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-6 py-12">
				<div className="space-y-8">
					{editingPage.blocks
						.sort((a, b) => a.order - b.order)
						.map((block) => (
							<InlineBlock
								key={block.id}
								block={block}
								isEditing={isEditing}
								editingSegment={editingSegment}
								onSegmentEdit={handleSegmentEdit}
								onSegmentSave={handleSegmentSave}
								onSegmentCancel={handleSegmentCancel}
								onBlockChange={(updatedBlock) =>
									handleBlockChange(block.id, updatedBlock)
								}
								onBlockDelete={() => handleDeleteBlock(block.id)}
								onAddSegment={(segmentType) =>
									handleAddSegment(block.id, segmentType)
								}
							/>
						))}

					{/* Add Block Buttons */}
					<AnimatePresence>
						{isEditing && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="overflow-hidden"
							>
								<div className="flex gap-4 pt-8 border-t border-border">
									<button
										onClick={() => handleAddBlock("heading")}
										className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
									>
										<Type className="w-5 h-5" />
										Add Heading
									</button>
									<button
										onClick={() => handleAddBlock("paragraph")}
										className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
									>
										<FileText className="w-5 h-5" />
										Add Paragraph
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
