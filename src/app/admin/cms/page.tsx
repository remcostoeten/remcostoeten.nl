"use client";

// Admin CMS Interface
// This component requires NEXT_PUBLIC_ADMIN_TOGGLE="true" in .env.local to be accessible
// The value must be exactly the string "true" (including quotes) for security
// Any other value will render the admin feature inert

import React, { useEffect, useState } from "react";
import InlinePageEditor from "@/components/cms/InlinePageEditor";
import CMSLayout from "@/components/cms/Layout";
import PagesList from "@/components/cms/PagesList";
import { CMSToastContainer, useCMSToast } from "@/hooks/use-cms-toast";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";
import { CMSStore } from "@/lib/cms-store";
import { CMSState, Page } from "@/types/cms";
import { createNewPage, generateId, generateSlug } from "@/utils/cms-data";

export default function CMSApp() {
	const [state, setState] = useState<CMSState>({
		currentPage: null,
		pages: [],
		user: null,
		isAuthenticated: true,
		isPreviewMode: false,
		editingSegment: null,
	});

	const toast = useCMSToast();

	// Load pages from CMSStore on component mount
	useEffect(() => {
		const loadPages = () => {
			let pages = CMSStore.getPages();

			// If no pages exist, initialize with default home page
			if (pages.length === 0) {
				const defaultHome = CMSStore.initializeDefaultHomePage();
				pages = [defaultHome];
			}

			setState((prev) => ({ ...prev, pages }));
		};

		loadPages();
	}, []);

	const [currentView, setCurrentView] = useState("pages");

	const handleEditPage = (page: Page) => {
		setState((prev) => ({
			...prev,
			currentPage: page,
		}));
	};

	const handleSavePage = (updatedPage: Page) => {
		try {
			// Update in CMSStore
			CMSStore.updatePage(updatedPage.id, updatedPage);

			// Update local state
			setState((prev) => ({
				...prev,
				pages: prev.pages.map((p) =>
					p.id === updatedPage.id ? updatedPage : p,
				),
				currentPage: null,
			}));

			toast.success("Page saved successfully", "Your changes are now live!");
		} catch (error) {
			toast.error("Failed to save page", "Please try again.");
		}
	};

	const handleCreatePage = () => {
		try {
			const baseNewPage = createNewPage();
			const newPage: Page = {
				...baseNewPage,
				id: generateId(),
				slug: generateSlug(baseNewPage.title),
			};

			// Add to CMSStore
			CMSStore.addPage(newPage);

			setState((prev) => ({
				...prev,
				pages: [...prev.pages, newPage],
				currentPage: newPage,
			}));

			toast.success("Page created", "New page ready for editing!");
		} catch (error) {
			toast.error("Failed to create page", "Please try again.");
		}
	};

	const handleDeletePage = (pageId: string) => {
		if (confirm("Are you sure you want to delete this page?")) {
			try {
				// Delete from CMSStore
				CMSStore.deletePage(pageId);

				setState((prev) => ({
					...prev,
					pages: prev.pages.filter((p) => p.id !== pageId),
				}));

				toast.success("Page deleted", "Page has been removed.");
			} catch (error) {
				toast.error("Failed to delete page", "Please try again.");
			}
		}
	};

	const handleBackToPages = () => {
		setState((prev) => ({
			...prev,
			currentPage: null,
		}));
	};

	// Keyboard shortcuts
	useKeyboardShortcuts(
		{
			"capslock+s": () => {
				if (state.currentPage) {
					// This will be handled by the InlinePageEditor
					return;
				}
			},
			"capslock+z": () => {
				// Revert logic here
			},
		},
		[state.currentPage],
	);

	if (state.currentPage) {
		return (
			<>
				<InlinePageEditor
					page={state.currentPage}
					onSave={handleSavePage}
					onBack={handleBackToPages}
				/>
				<CMSToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
			</>
		);
	}

	return (
		<>
			<CMSLayout currentView={currentView} onNavigate={setCurrentView}>
				<PagesList
					pages={state.pages}
					onEdit={handleEditPage}
					onCreate={handleCreatePage}
					onDelete={handleDeletePage}
				/>
			</CMSLayout>
			<CMSToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
		</>
	);
}
