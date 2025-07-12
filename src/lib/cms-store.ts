import { Page } from '@/types/cms';

const CMS_STORAGE_KEY = 'cms_pages';
const HOME_PAGE_KEY = 'home_page';

export class CMSStore {
  // Get all pages from localStorage
  static getPages(): Page[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(CMS_STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const pages = JSON.parse(stored);
      return pages.map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      }));
    } catch {
      return [];
    }
  }

  // Save all pages to localStorage
  static savePages(pages: Page[]): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(pages));
    
    // If there's a home page, update the separate home page cache
    const homePage = pages.find(p => p.slug === 'home' && p.isPublished);
    if (homePage) {
      localStorage.setItem(HOME_PAGE_KEY, JSON.stringify(homePage));
    }
  }

  // Get the published home page content
  static getHomePageContent(): Page | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(HOME_PAGE_KEY);
    if (!stored) return null;
    
    try {
      const page = JSON.parse(stored);
      return {
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      };
    } catch {
      return null;
    }
  }

  // Initialize with default home page if none exists
  static initializeDefaultHomePage(): Page {
    const defaultHomePage: Page = {
      id: 'home',
      slug: 'home',
      title: 'Home',
      description: 'Home page content',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: [
        {
          id: 'block-1',
          type: 'heading',
          order: 0,
          content: [
            {
              id: 'seg-1',
              type: 'text',
              content: 'I craft digital experiences.'
            }
          ]
        },
        {
          id: 'block-2',
          type: 'paragraph',
          order: 1,
          content: [
            {
              id: 'seg-2',
              type: 'text',
              content: 'With extensive experience in '
            },
            {
              id: 'seg-3',
              type: 'highlighted',
              content: 'TypeScript and React & Next.js',
              data: { 
                hslColor: 'var(--highlight-frontend)',
                backgroundColor: 'hsl(var(--highlight-frontend) / 0.2)'
              }
            },
            {
              id: 'seg-4',
              type: 'text',
              content: ', I specialize in building scalable web applications, from Magento shops to modern SaaS platforms. Currently working on an '
            },
            {
              id: 'seg-5',
              type: 'highlighted',
              content: 'LMS system for Dutch MBO students',
              data: { 
                hslColor: 'var(--highlight-product)',
                backgroundColor: 'hsl(var(--highlight-product) / 0.2)'
              }
            },
            {
              id: 'seg-6',
              type: 'text',
              content: '.'
            }
          ]
        },
        {
          id: 'block-3',
          type: 'paragraph',
          order: 2,
          content: [
            {
              id: 'seg-7',
              type: 'text',
              content: 'Recently I\'ve been building '
            },
            {
              id: 'seg-8',
              type: 'project-card',
              content: 'Roll Your Own Authentication',
              data: { 
                url: 'https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication'
              }
            },
            {
              id: 'seg-9',
              type: 'text',
              content: ' and '
            },
            {
              id: 'seg-10',
              type: 'project-card',
              content: 'Turso DB Creator CLI',
              data: { 
                url: 'https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials'
              }
            },
            {
              id: 'seg-11',
              type: 'text',
              content: ' and various '
            },
            {
              id: 'seg-12',
              type: 'highlighted',
              content: 'CLI tools & automation scripts',
              data: { 
                hslColor: 'var(--highlight-frontend)',
                backgroundColor: 'hsl(var(--highlight-frontend) / 0.2)'
              }
            },
            {
              id: 'seg-13',
              type: 'text',
              content: '. More projects and experiments can be found on '
            },
            {
              id: 'seg-14',
              type: 'link',
              content: 'GitHub',
              data: { url: 'https://github.com/remcostoeten' }
            },
            {
              id: 'seg-15',
              type: 'text',
              content: '.'
            }
          ]
        }
      ]
    };

    // Save as both a page and home content
    const pages = this.getPages();
    const existingHome = pages.find(p => p.slug === 'home');
    
    if (!existingHome) {
      pages.push(defaultHomePage);
      this.savePages(pages);
    }

    return defaultHomePage;
  }

  // Update a specific page
  static updatePage(pageId: string, updatedPage: Page): void {
    const pages = this.getPages();
    const index = pages.findIndex(p => p.id === pageId);
    
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
    const filteredPages = pages.filter(p => p.id !== pageId);
    this.savePages(filteredPages);
  }
}
