import type { Pageview, CreatePageviewData, PageviewFilters, PageviewStats } from '../types/pageview';
import type { StorageAdapter } from '../storage/types';

export const createPageviewService = (storage: StorageAdapter) => ({
  async createPageview(data: CreatePageviewData): Promise<Pageview> {
    return storage.createPageview(data);
  },

  async getPageviews(filters: PageviewFilters): Promise<Pageview[]> {
    return storage.getPageviews(filters);
  },

  async getTotalCount(filters: Pick<PageviewFilters, 'url'>): Promise<number> {
    return storage.getTotalCount(filters);
  },

  async getStats(): Promise<PageviewStats> {
    return storage.getStats();
  },
});

export type PageviewService = ReturnType<typeof createPageviewService>;
