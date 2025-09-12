import type { Pageview, CreatePageviewData, PageviewFilters, PageviewStats } from '../types/pageview';

export interface StorageAdapter {
  createPageview(data: CreatePageviewData): Promise<Pageview>;
  getPageviews(filters: PageviewFilters): Promise<Pageview[]>;
  getTotalCount(filters: Pick<PageviewFilters, 'url'>): Promise<number>;
  getStats(): Promise<PageviewStats>;
}

export type StorageType = 'memory' | 'sqlite';
