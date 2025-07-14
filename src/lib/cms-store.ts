import { Page } from "@/types/cms";
import { homePage } from "@/utils/cms-data";

const CMS_STORAGE_KEY = "cms_pages";
const HOME_PAGE_KEY = "home_page";

export class CMSStore {
	// Get all pages from localStorage
	static getPages(): Page[] {
		if (typeof window === "undefined") return [];

		const stored = localStorage.getItem(CMS_STORAGE_KEY);
		if (!stored) return [];

		try {
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

	// Save all pages to localStorage
	static savePages(pages: Page[]): void {
		if (typeof window === "undefined") return;

		localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(pages));

		// If there's a home page, update the separate home page cache
		const homePage = pages.find((p) => p.slug === "home" && p.isPublished);
		if (homePage) {
			localStorage.setItem(HOME_PAGE_KEY, JSON.stringify(homePage));
		}
	}

	// Get the published home page content
	static getHomePageContent(): Page | null {
		if (typeof window === "undefined") return null;

		const stored = localStorage.getItem(HOME_PAGE_KEY);
		if (!stored) return null;

		try {
			const page = JSON.parse(stored);
			return {
				...page,
				createdAt: new Date(page.createdAt),
				updatedAt: new Date(page.updatedAt),
			};
		} catch {
			return null;
		}
	}

	// Initialize with default home page if none exists
	static initializeDefaultHomePage(): Page {
		const defaultHomePage: Page = {
			...homePage,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Save as both a page and home content
		const pages = this.getPages();
		const existingHome = pages.find((p) => p.slug === "home");

		if (!existingHome) {
			pages.push(defaultHomePage);
			this.savePages(pages);
		}

		return defaultHomePage;
	}

	// Update a specific page
	static updatePage(pageId: string, updatedPage: Page): void {
		const pages = this.getPages();
		const index = pages.findIndex((p) => p.id === pageId);

		if (index !== -1) {
			pages[index] = updatedPage;
			this.savePages(pages);
		}
	}

	// Add a new page
	static addPage(page: Page): void {
		const pages = this.getPages();
		pages.push(page);
		this.savePages(pages);
	}

	// Delete a page
	static deletePage(pageId: string): void {
		const pages = this.getPages();
		const filteredPages = pages.filter((p) => p.id !== pageId);
		this.savePages(filteredPages);
	}

	// Clear all CMS data (for development/testing)
	static clearAll(): void {
		if (typeof window === "undefined") return;
		localStorage.removeItem(CMS_STORAGE_KEY);
		localStorage.removeItem(HOME_PAGE_KEY);
	}
}
