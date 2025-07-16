import { useCallback, useEffect, useMemo, useReducer } from "react";
import { cmsApiClient } from "@/lib/cms/api-client";
import { TPageContent } from "@/lib/cms/types";
import { Page } from "@/types/cms";
import { createNewPage, generateId, generateSlug } from "@/utils/cms-data";

type PagesAction =
	| { type: "SET_PAGES"; payload: Page[] }
	| { type: "ADD_PAGE"; payload: Page }
	| { type: "UPDATE_PAGE"; payload: { id: string; page: Page } }
	| { type: "DELETE_PAGE"; payload: string }
	| { type: "DELETE_PAGES_BULK"; payload: string[] }
	| { type: "SET_CURRENT_PAGE"; payload: Page | null }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }
	| { type: "CLEAR_ERROR" };

interface PagesState {
	pages: Page[];
	currentPage: Page | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: PagesState = {
	pages: [],
	currentPage: null,
	isLoading: false,
	error: null,
};

function pagesReducer(state: PagesState, action: PagesAction): PagesState {
	switch (action.type) {
		case "SET_PAGES":
			return { ...state, pages: action.payload, error: null };
		case "ADD_PAGE":
			return { ...state, pages: [...state.pages, action.payload], error: null };
		case "UPDATE_PAGE":
			return {
				...state,
				pages: state.pages.map((page) =>
					page.id === action.payload.id ? action.payload.page : page,
				),
				error: null,
			};
		case "DELETE_PAGE":
			return {
				...state,
				pages: state.pages.filter((page) => page.id !== action.payload),
				currentPage:
					state.currentPage?.id === action.payload ? null : state.currentPage,
				error: null,
			};
		case "DELETE_PAGES_BULK":
			return {
				...state,
				pages: state.pages.filter((page) => {
					if (page.slug === "home") {
						return true;
					}
					return !action.payload.includes(page.id);
				}),
				currentPage:
					state.currentPage && action.payload.includes(state.currentPage.id)
						? null
						: state.currentPage,
				error: null,
			};
		case "SET_CURRENT_PAGE":
			return { ...state, currentPage: action.payload };
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload, isLoading: false };
		case "CLEAR_ERROR":
			return { ...state, error: null };
		default:
			return state;
	}
}

// Storage utilities
class PagesStorage {
	private static readonly STORAGE_KEY = "cms_pages";
	private static readonly HOME_PAGE_KEY = "home_page";

	static getPages(): Page[] {
		if (typeof window === "undefined") return [];

		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (!stored) return [];

			const pages = JSON.parse(stored);
			return pages.map((page: any) => ({
				...page,
				createdAt: new Date(page.createdAt),
				updatedAt: new Date(page.updatedAt),
			}));
		} catch {
			return [];
		}
	}

	static savePages(pages: Page[]): void {
		if (typeof window === "undefined") return;

		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pages));

		// Update home page cache
		const homePage = pages.find((p) => p.slug === "home" && p.isPublished);
		if (homePage) {
			localStorage.setItem(this.HOME_PAGE_KEY, JSON.stringify(homePage));
		}
	}

	static clearAll(): void {
		if (typeof window === "undefined") return;
		localStorage.removeItem(this.STORAGE_KEY);
		localStorage.removeItem(this.HOME_PAGE_KEY);
	}
}

// Main hook
export function usePagesState() {
	const [state, dispatch] = useReducer(pagesReducer, initialState);

	// Load pages from localStorage on mount
	useEffect(() => {
		const loadPages = () => {
			dispatch({ type: "SET_LOADING", payload: true });

			try {
				const storedPages = PagesStorage.getPages();
				dispatch({ type: "SET_PAGES", payload: storedPages });
			} catch (error) {
				dispatch({ type: "SET_ERROR", payload: "Failed to load pages" });
			} finally {
				dispatch({ type: "SET_LOADING", payload: false });
			}
		};

		loadPages();
	}, []);

	// Save pages to localStorage whenever pages change
	useEffect(() => {
		if (state.pages.length > 0) {
			PagesStorage.savePages(state.pages);
		}
	}, [state.pages]);

	// Actions - separate useCallback hooks to maintain hook order
	const createPage = useCallback(() => {
		dispatch({ type: "CLEAR_ERROR" });

		try {
			const baseNewPage = createNewPage();
			const newPage: Page = {
				...baseNewPage,
				id: generateId(),
				slug: generateSlug(baseNewPage.title),
			};

			dispatch({ type: "ADD_PAGE", payload: newPage });
			dispatch({ type: "SET_CURRENT_PAGE", payload: newPage });

			return newPage;
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: "Failed to create page" });
			throw error;
		}
	}, []);

	const createHomepage = useCallback(async () => {
		dispatch({ type: "CLEAR_ERROR" });
		dispatch({ type: "SET_LOADING", payload: true });

		try {
			const existingHomepage = state.pages.find((p) => p.slug === "home");
			if (existingHomepage) {
				dispatch({ type: "SET_LOADING", payload: false });
				return existingHomepage;
			}

			// First, ensure the homepage content exists in the database
			await cmsApiClient.ensureHomepageContent();

			// Load the homepage content from the database
			const homePageContent = await cmsApiClient.getHomePage();

			// Convert database content to frontend page format
			const homePage: Page = {
				id: generateId(),
				title: "Home",
				slug: "home",
				description: "Welcome to my website",
				isPublished: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				blocks: homePageContent.blocks.map((block) => ({
					id: block.id.toString(),
					type: block.blockType,
					order: block.order,
					content: block.segments.map((segment) => ({
						id: segment.id.toString(),
						type: segment.type,
						content: segment.content,
						order: segment.order,
						href: segment.href || undefined,
						target: segment.target || undefined,
						className: segment.className || undefined,
						style: segment.style || undefined,
						metadata: segment.metadata || undefined,
					})),
				})),
			};

			dispatch({ type: "ADD_PAGE", payload: homePage });
			dispatch({ type: "SET_LOADING", payload: false });

			return homePage;
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: "Failed to create homepage" });
			dispatch({ type: "SET_LOADING", payload: false });
			throw error;
		}
	}, [state.pages]);

	const updatePage = useCallback(async (pageId: string, updatedPage: Page) => {
		dispatch({ type: "CLEAR_ERROR" });
		dispatch({ type: "SET_LOADING", payload: true });

		try {
			const pageContent: TPageContent = {
				blocks: updatedPage.blocks.map((block) => ({
					...block,
					blockType: block.type,
					segments: block.content,
				})),
			};

			await cmsApiClient.updatePage(updatedPage.slug, pageContent);

			dispatch({
				type: "UPDATE_PAGE",
				payload: { id: pageId, page: updatedPage },
			});
			dispatch({ type: "SET_CURRENT_PAGE", payload: null });

			return updatedPage;
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: "Failed to save page" });
			throw error;
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	}, []);

	const deletePage = useCallback(
		async (pageId: string) => {
			dispatch({ type: "CLEAR_ERROR" });
			dispatch({ type: "SET_LOADING", payload: true });

			try {
				// Find the page to get its slug
				const pageToDelete = state.pages.find((p) => p.id === pageId);
				if (!pageToDelete) {
					throw new Error("Page not found");
				}

				await cmsApiClient.deletePage(pageToDelete.slug);
				dispatch({ type: "DELETE_PAGE", payload: pageId });
			} catch (error) {
				dispatch({ type: "SET_ERROR", payload: "Failed to delete page" });
				throw error;
			} finally {
				dispatch({ type: "SET_LOADING", payload: false });
			}
		},
		[state.pages],
	);

	const bulkDeletePages = useCallback(
		async (pageIds: string[]) => {
			dispatch({ type: "CLEAR_ERROR" });
			dispatch({ type: "SET_LOADING", payload: true });

			try {
				// Convert page IDs to slugs for the API call
				const pagesToDelete = state.pages.filter((p) => pageIds.includes(p.id));
				const slugsToDelete = pagesToDelete.map((p) => p.slug);

				await cmsApiClient.bulkDeletePages(slugsToDelete);
				dispatch({ type: "DELETE_PAGES_BULK", payload: pageIds });
			} catch (error) {
				dispatch({ type: "SET_ERROR", payload: "Failed to bulk delete pages" });
				throw error;
			} finally {
				dispatch({ type: "SET_LOADING", payload: false });
			}
		},
		[state.pages],
	);

	const setCurrentPage = useCallback((page: Page | null) => {
		dispatch({ type: "SET_CURRENT_PAGE", payload: page });
	}, []);

	const refreshData = useCallback(() => {
		dispatch({ type: "CLEAR_ERROR" });

		try {
			PagesStorage.clearAll();
			dispatch({ type: "SET_PAGES", payload: [] });
		} catch (error) {
			dispatch({ type: "SET_ERROR", payload: "Failed to refresh data" });
			throw error;
		}
	}, []);

	const clearError = useCallback(() => {
		dispatch({ type: "CLEAR_ERROR" });
	}, []);

	const actions = useMemo(
		() => ({
			createPage,
			createHomepage,
			updatePage,
			deletePage,
			bulkDeletePages,
			setCurrentPage,
			refreshData,
			clearError,
		}),
		[
			createPage,
			createHomepage,
			updatePage,
			deletePage,
			bulkDeletePages,
			setCurrentPage,
			refreshData,
			clearError,
		],
	);

	// Computed values
	const computed = useMemo(
		() => ({
			totalPages: state.pages.length,
			hasHomepage: state.pages.some((p) => p.slug === "home"),
			publishedPages: state.pages.filter((p) => p.isPublished),
			pageCountText: `${state.pages.length} ${state.pages.length === 1 ? "page" : "pages"}`,
		}),
		[state.pages],
	);

	return {
		...state,
		actions,
		computed,
	};
}

// Hook for persisting state to localStorage
export function usePersistentState() {
	const saveToStorage = useCallback((key: string, value: any) => {
		if (typeof window === "undefined") return;

		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error("Failed to save to localStorage:", error);
		}
	}, []);

	const loadFromStorage = useCallback(
		(key: string, defaultValue: any = null) => {
			if (typeof window === "undefined") return defaultValue;

			try {
				const stored = localStorage.getItem(key);
				return stored ? JSON.parse(stored) : defaultValue;
			} catch (error) {
				console.error("Failed to load from localStorage:", error);
				return defaultValue;
			}
		},
		[],
	);

	const removeFromStorage = useCallback((key: string) => {
		if (typeof window === "undefined") return;

		try {
			localStorage.removeItem(key);
		} catch (error) {
			console.error("Failed to remove from localStorage:", error);
		}
	}, []);

	return {
		saveToStorage,
		loadFromStorage,
		removeFromStorage,
	};
}
