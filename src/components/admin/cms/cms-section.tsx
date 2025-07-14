"use client";

import React, { useEffect, useState } from "react";
import InlinePageEditor from "@/components/cms/inline-page-editor";
import { PagesList } from "@/components/cms/pages-list";
import { CMSToastContainer, useCMSToast } from "@/hooks/use-cms-toast";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";
import { CMSStore } from "@/lib/cms-store";
import { CMSState, Page } from "@/types/cms";
import { createNewPage, generateId, generateSlug } from "@/utils/cms-data";
import { createCmsFactory } from "@/lib/cms/cms-factory";
import { TPageContent } from "@/lib/cms/types";

export function CMSSection() {
	const [state, setState] = useState<CMSState>({
		currentPage: null,
		pages: [],
		user: null,
		isAuthenticated: true,
		isPreviewMode: false,
		editingSegment: null,
	});

	const toast = useCMSToast();
	const cmsFactory = createCmsFactory();

	useEffect(function loadInitialPages() {
		function loadPages() {
			let pages = CMSStore.getPages();

			// Check if homepage exists
			const homePageExists = pages.some(page => page.slug === "home");
			
			if (!homePageExists) {
				// Create and add homepage
				const defaultHome = CMSStore.initializeDefaultHomePage();
				pages = [defaultHome, ...pages];
				// Save the updated pages array
				CMSStore.savePages(pages);
			}

			setState(function updatePages(prev) {
				return { ...prev, pages };
			});
		}

		loadPages();
	}, []);

	function handleEditPage(page: Page) {
		setState((prev) => ({
			...prev,
			currentPage: page,
		}));
	}

	async function handleSavePage(updatedPage: Page) {
		try {
			console.log("Saving page to database:", updatedPage);

			const pageContent: TPageContent = { 
				blocks: updatedPage.blocks.map(block => ({ 
					...block, 
					blockType: block.type, 
					segments: block.content 
				})) 
			};
			await cmsFactory.savePageContent(updatedPage.id, pageContent);
			console.log("Page saved successfully to database:", updatedPage);

			CMSStore.updatePage(updatedPage.id, updatedPage);

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
	}

	function handleCreatePage() {
		try {
			const baseNewPage = createNewPage();
			const newPage: Page = {
				...baseNewPage,
				id: generateId(),
				slug: generateSlug(baseNewPage.title),
			};

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
	}

	function handleCreateHomepage() {
		try {
			const homePage = CMSStore.initializeDefaultHomePage();
			const updatedPages = [homePage, ...state.pages];
			CMSStore.savePages(updatedPages);

			setState((prev) => ({
				...prev,
				pages: updatedPages,
			}));

			toast.success("Homepage created", "Homepage is now available in the CMS!");
		} catch (error) {
			toast.error("Failed to create homepage", "Please try again.");
		}
	}

	function handleDeletePage(pageId: string) {
		if (confirm("Are you sure you want to delete this page?")) {
			try {
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
	}

	function handleBackToPages() {
		setState((prev) => ({
			...prev,
			currentPage: null,
		}));
	}

	useKeyboardShortcuts(
		{
			"capslock+s": () => {
				if (state.currentPage) {
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
			<PagesList
				pages={state.pages}
				onEdit={handleEditPage}
				onCreate={handleCreatePage}
				onCreateHomepage={handleCreateHomepage}
				onDelete={handleDeletePage}
			/>
			<CMSToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
		</>
	);
}
