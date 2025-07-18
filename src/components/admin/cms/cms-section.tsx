"use client";

import React, { useEffect, useRef } from "react";
import InlinePageEditor from "@/components/cms/inline-page-editor";
import KeyboardShortcutsLegend from "@/components/cms/keyboard-shortcuts-legend";
import { PagesList } from "@/components/cms/pages-list";
import { CMSToastContainer, useCMSToast } from "@/hooks/use-cms-toast";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";
import { usePagesState } from "@/hooks/use-pages-state";
import { Page } from "@/types/cms";
import WidthControl from "@/components/settings/WidthControl";
import { AccentColorPicker } from "@/components/cms/accent-color-picker";

export function CMSSection() {
	const { pages, currentPage, isLoading, error, actions, computed } =
		usePagesState();
	const toast = useCMSToast();
	const homepageCreatedRef = useRef(false);

	// Initialize homepage if it doesn't exist (only on first load)
	useEffect(() => {
		if (
			!isLoading &&
			pages.length === 0 &&
			!computed.hasHomepage &&
			!homepageCreatedRef.current
		) {
			homepageCreatedRef.current = true;
			actions.createHomepage().catch((error) => {
				console.error("Failed to create homepage:", error);
				toast.error("Failed to create homepage", "Please try again.");
				homepageCreatedRef.current = false;
			});
		}
	}, [isLoading, pages.length, computed.hasHomepage, actions, toast]);

	function handleEditPage(page: Page) {
		actions.setCurrentPage(page);
	}

	async function handleSavePage(updatedPage: Page) {
		try {
			await actions.updatePage(updatedPage.id, updatedPage);
			toast.success("Page saved successfully", "Your changes are now live!");
		} catch (error) {
			toast.error("Failed to save page", "Please try again.");
		}
	}

	function handleCreatePage() {
		try {
			actions.createPage();
			toast.success("Page created", "New page ready for editing!");
		} catch (error) {
			toast.error("Failed to create page", "Please try again.");
		}
	}

	async function handleCreateHomepage() {
		try {
			await actions.createHomepage();
			toast.success(
				"Homepage created",
				"Homepage is now available in the CMS!",
			);
		} catch (error) {
			toast.error("Failed to create homepage", "Please try again.");
		}
	}

	function handleRefreshCMSData() {
		if (
			confirm(
				"This will clear all CMS data and reload with fresh data. Are you sure?",
			)
		) {
			try {
				actions.refreshData();
				toast.success(
					"CMS data refreshed",
					"All data has been reset with fresh content!",
				);
			} catch (error) {
				toast.error("Failed to refresh CMS data", "Please try again.");
			}
		}
	}

	async function handleDeletePage(pageId: string) {
		if (confirm("Are you sure you want to delete this page?")) {
			try {
				await actions.deletePage(pageId);
				toast.success("Page deleted", "Page has been removed.");
			} catch (error) {
				toast.error("Failed to delete page", "Please try again.");
			}
		}
	}

	async function handleBulkDeletePages(pageIds: string[]) {
		try {
			await actions.bulkDeletePages(pageIds);
			toast.success(
				"Pages deleted",
				`${pageIds.length} page${pageIds.length === 1 ? "" : "s"} have been removed.`,
			);
		} catch (error) {
			toast.error("Failed to delete pages", "Please try again.");
		}
	}

	function handleBackToPages() {
		actions.setCurrentPage(null);
	}

	useKeyboardShortcuts(
		{
			"capslock+s": () => {
				if (currentPage) {
					return;
				}
			},
			"capslock+z": () => {
				// Revert logic here
			},
			"cmd+h": () => {
				// Edit homepage
				const homePage = pages.find((p) => p.slug === "home");
				if (homePage) {
					handleEditPage(homePage);
				}
			},
			"cmd+s": async () => {
				// Save current page
				if (currentPage) {
					await handleSavePage(currentPage);
				}
			},
			"cmd+p": () => {
				// Preview page
				if (currentPage) {
					const url =
						currentPage.slug === "home" ? "/" : `/${currentPage.slug}`;
					window.open(url, "_blank");
				}
			},
			"cmd+e": () => {
				// Return to editing without saving
				if (currentPage) {
					actions.setCurrentPage(null);
				}
			},
			"cmd+a": () => {
				// Select all pages (when not in editor)
				if (!currentPage) {
					// This will be handled in the PagesList component
				}
			},
			delete: () => {
				// Delete selected pages (when not in editor)
				if (!currentPage) {
					// This will be handled in the PagesList component
				}
			},
		},
		[currentPage, pages],
	);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading pages...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<p className="text-destructive mb-2">Error: {error}</p>
					<button
						onClick={() => actions.clearError()}
						className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	if (currentPage) {
		return (
			<>
				<InlinePageEditor
					page={currentPage}
					onSave={handleSavePage}
					onBack={handleBackToPages}
				/>
				<KeyboardShortcutsLegend />
				<CMSToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
			</>
		);
	}

	return (
		<>
			{/* Global Width Control for all pages */}
			<div className="mb-6">
				<WidthControl global={true} />
			</div>

			{/* Theme Settings */}
			<div className="mb-6">
				<AccentColorPicker
					onColorChange={(color) => {
						toast.success("Accent color updated", `New color: ${color}`);
					}}
				/>
			</div>

			<PagesList
				pages={pages}
				onEdit={handleEditPage}
				onCreate={handleCreatePage}
				onCreateHomepage={handleCreateHomepage}
				onDelete={handleDeletePage}
				onRefresh={handleRefreshCMSData}
				onBulkDelete={handleBulkDeletePages}
			/>

			<KeyboardShortcutsLegend />
			<CMSToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
		</>
	);
}
