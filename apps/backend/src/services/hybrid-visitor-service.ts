import type { 
  Visitor, 
  BlogView, 
  CreateVisitorData, 
  CreateBlogViewData, 
  VisitorStats 
} from '../types/visitor';
import { setupVisitorService } from './visitor-service';
import { setupVisitorService as setupMemoryVisitorService } from './memory-visitor-service';

function createHybridVisitorService() {
  let databaseService: ReturnType<typeof setupVisitorService> | null = null;
  let memoryService: ReturnType<typeof setupMemoryVisitorService> | null = null;
  let useDatabase = false;

  // Try to initialize database service
  try {
    databaseService = setupVisitorService();
    useDatabase = true;
    console.log('✅ Using database storage for visitors');
  } catch (error) {
    console.warn('⚠️ Database not available, falling back to memory storage for visitors');
    memoryService = setupMemoryVisitorService();
    useDatabase = false;
  }

  return {
    async trackVisitor(data: CreateVisitorData): Promise<Visitor> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.trackVisitor(data);
        } catch (error) {
          console.warn('Database visitor tracking failed, using memory storage:', error);
          if (!memoryService) {
            memoryService = setupMemoryVisitorService();
          }
          return memoryService.trackVisitor(data);
        }
      }
      if (!memoryService) {
        memoryService = setupMemoryVisitorService();
      }
      return memoryService.trackVisitor(data);
    },

    async trackBlogView(data: CreateBlogViewData): Promise<BlogView> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.trackBlogView(data);
        } catch (error) {
          console.warn('Database blog view tracking failed, using memory storage:', error);
          if (!memoryService) {
            memoryService = setupMemoryVisitorService();
          }
          return memoryService.trackBlogView(data);
        }
      }
      if (!memoryService) {
        memoryService = setupMemoryVisitorService();
      }
      return memoryService.trackBlogView(data);
    },

    async getVisitorStats(): Promise<VisitorStats> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.getVisitorStats();
        } catch (error) {
          console.warn('Database visitor stats failed, using memory storage:', error);
          if (!memoryService) {
            memoryService = setupMemoryVisitorService();
          }
          return memoryService.getVisitorStats();
        }
      }
      if (!memoryService) {
        memoryService = setupMemoryVisitorService();
      }
      return memoryService.getVisitorStats();
    },

    async getBlogViewCount(blogSlug: string): Promise<{
      totalViews: number;
      uniqueViewers: number;
      newVisitorViews: number;
      returningVisitorViews: number;
    }> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.getBlogViewCount(blogSlug);
        } catch (error) {
          console.warn('Database blog view count failed, using memory storage:', error);
          if (!memoryService) {
            memoryService = setupMemoryVisitorService();
          }
          return memoryService.getBlogViewCount(blogSlug);
        }
      }
      if (!memoryService) {
        memoryService = setupMemoryVisitorService();
      }
      return memoryService.getBlogViewCount(blogSlug);
    },

    async getVisitor(visitorId: string): Promise<Visitor | null> {
      if (useDatabase && databaseService) {
        try {
          return await databaseService.getVisitor(visitorId);
        } catch (error) {
          console.warn('Database visitor retrieval failed, using memory storage:', error);
          if (!memoryService) {
            memoryService = setupMemoryVisitorService();
          }
          return memoryService.getVisitor(visitorId);
        }
      }
      if (!memoryService) {
        memoryService = setupMemoryVisitorService();
      }
      return memoryService.getVisitor(visitorId);
    },
  };
}

export type HybridVisitorService = ReturnType<typeof createHybridVisitorService>;
export { createHybridVisitorService };


