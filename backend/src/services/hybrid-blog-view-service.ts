import { db } from '../db';
import { createBlogViewService } from './blog-view-service';
import { createMemoryBlogViewService } from './memory-blog-view-service';
import type { BlogViewService } from './blog-view-service';
import type { MemoryBlogViewService } from './memory-blog-view-service';

function createHybridBlogViewService(): BlogViewService | MemoryBlogViewService {
  if (db) {
    console.log('✅ Using database blog view service');
    return createBlogViewService();
  } else {
    console.log('⚠️ Using memory blog view service (database not available)');
    return createMemoryBlogViewService();
  }
}

export { createHybridBlogViewService };