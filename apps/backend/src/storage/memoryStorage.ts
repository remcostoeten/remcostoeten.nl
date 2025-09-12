import type { StorageAdapter } from './types';
import type { Pageview, CreatePageviewData, PageviewFilters, PageviewStats } from '../types/pageview';

export const createMemoryStorage = (): StorageAdapter => {
  // In-memory storage for demo purposes
  const pageviews: Pageview[] = [];

  return {
    async createPageview(data: CreatePageviewData): Promise<Pageview> {
      const pageview: Pageview = {
        id: crypto.randomUUID(),
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      pageviews.push(pageview);
      
      // Keep only last 1000 pageviews in memory for demo
      if (pageviews.length > 1000) {
        pageviews.splice(0, pageviews.length - 1000);
      }

      return pageview;
    },

    async getPageviews(filters: PageviewFilters): Promise<Pageview[]> {
      let filteredPageviews = [...pageviews];

      // Filter by URL if provided
      if (filters.url) {
        filteredPageviews = filteredPageviews.filter(pv => 
          pv.url.includes(filters.url!)
        );
      }

      // Sort by timestamp (newest first)
      filteredPageviews.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      
      return filteredPageviews.slice(offset, offset + limit);
    },

    async getTotalCount(filters: Pick<PageviewFilters, 'url'>): Promise<number> {
      if (filters.url) {
        return pageviews.filter(pv => pv.url.includes(filters.url!)).length;
      }
      return pageviews.length;
    },

    async getStats(): Promise<PageviewStats> {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const total = pageviews.length;
      const todayCount = pageviews.filter(pv => 
        new Date(pv.timestamp) >= today
      ).length;
      const yesterdayCount = pageviews.filter(pv => {
        const pvDate = new Date(pv.timestamp);
        return pvDate >= yesterday && pvDate < today;
      }).length;
      const thisWeekCount = pageviews.filter(pv => 
        new Date(pv.timestamp) >= thisWeek
      ).length;

      // Get unique URLs
      const uniqueUrls = new Set(pageviews.map(pv => pv.url)).size;

      // Get top pages
      const urlCounts = pageviews.reduce((acc, pv) => {
        acc[pv.url] = (acc[pv.url] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPages = Object.entries(urlCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([url, count]) => ({ url, count }));

      return {
        total,
        today: todayCount,
        yesterday: yesterdayCount,
        thisWeek: thisWeekCount,
        uniqueUrls,
        topPages,
      };
    },
  };
};
