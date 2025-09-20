import type { Pageview, CreatePageviewData, PageviewFilters, PageviewStats } from '../types/pageview';
import { createDatabasePageviewService } from './database-pageview-service';
import { createMemoryStorage } from '../storage/memoryStorage';

function createHybridPageviewService() {
  const memoryStorage = createMemoryStorage();
  let databaseService: ReturnType<typeof createDatabasePageviewService> | null = null;
  let useDatabase = false;

  // Try to initialize database service
  try {
    databaseService = createDatabasePageviewService();
    useDatabase = true;
    console.log('✅ Using database storage for pageviews');
  } catch (error) {
    console.warn('⚠️ Database not available, falling back to memory storage for pageviews');
    useDatabase = false;
  }

  return {
    async createPageview(data: CreatePageviewData): Promise<Pageview> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.createPageview(data);
        } catch (error) {
          console.warn('Database pageview creation failed, using memory storage:', error);
          return memoryStorage.createPageview(data);
        }
      }
      return memoryStorage.createPageview(data);
    },

    async getPageviews(filters: PageviewFilters): Promise<Pageview[]> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.getPageviews(filters);
        } catch (error) {
          console.warn('Database pageview retrieval failed, using memory storage:', error);
          return memoryStorage.getPageviews(filters);
        }
      }
      return memoryStorage.getPageviews(filters);
    },

    async getTotalCount(filters: Pick<PageviewFilters, 'url'>): Promise<number> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.getTotalCount(filters);
        } catch (error) {
          console.warn('Database count retrieval failed, using memory storage:', error);
          return memoryStorage.getTotalCount(filters);
        }
      }
      return memoryStorage.getTotalCount(filters);
    },

    async getStats(): Promise<PageviewStats> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.getStats();
        } catch (error) {
          console.warn('Database stats retrieval failed, using memory storage:', error);
          return memoryStorage.getStats();
        }
      }
      return memoryStorage.getStats();
    },
  };
}

export type HybridPageviewService = ReturnType<typeof createHybridPageviewService>;
export { createHybridPageviewService };


