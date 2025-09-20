import type { Pageview, CreatePageviewData, PageviewFilters, PageviewStats } from '../types/pageview';
import type { HybridPageviewService } from './hybrid-pageview-service';

export const createPageviewService = (hybridService: HybridPageviewService) => ({
  async createPageview(data: CreatePageviewData): Promise<Pageview> {
    return hybridService.createPageview(data);
  },

  async getPageviews(filters: PageviewFilters): Promise<Pageview[]> {
    return hybridService.getPageviews(filters);
  },

  async getTotalCount(filters: Pick<PageviewFilters, 'url'>): Promise<number> {
    return hybridService.getTotalCount(filters);
  },

  async getStats(): Promise<PageviewStats> {
    return hybridService.getStats();
  },
});

export type PageviewService = ReturnType<typeof createPageviewService>;
