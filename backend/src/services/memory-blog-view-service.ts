import type { 
  BlogView, 
  CreateBlogViewData, 
  BlogViewFilters, 
  BlogViewStats,
  BlogPostViewCount
} from '../types/blog-view';

// In-memory storage for blog views when database is not available
const blogViews = new Map<string, BlogView>();
const sessionViews = new Set<string>(); // Track session+slug combinations

function createMemoryBlogViewService() {
  return {
    async recordView(data: CreateBlogViewData): Promise<{ success: boolean; isNewView: boolean; view?: BlogView }> {
      const sessionSlugKey = `${data.sessionId}:${data.slug}`;
      
      // Check if this session has already viewed this post
      if (sessionViews.has(sessionSlugKey)) {
        // Find the existing view
        const existingView = Array.from(blogViews.values())
          .find(view => view.sessionId === data.sessionId && view.slug === data.slug);
        
        return {
          success: true,
          isNewView: false,
          view: existingView
        };
      }

      // Create new view
      const now = new Date().toISOString();
      const view: BlogView = {
        id: crypto.randomUUID(),
        slug: data.slug,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
        timestamp: data.timestamp || now,
        createdAt: now,
      };

      blogViews.set(view.id, view);
      sessionViews.add(sessionSlugKey);

      return {
        success: true,
        isNewView: true,
        view
      };
    },

    async getViewCount(slug: string): Promise<BlogPostViewCount> {
      const views = Array.from(blogViews.values()).filter(view => view.slug === slug);
      const uniqueSessions = new Set(views.map(view => view.sessionId));

      return {
        slug,
        totalViews: views.length,
        uniqueViews: uniqueSessions.size
      };
    },

    async getMultipleViewCounts(slugs: string[]): Promise<BlogPostViewCount[]> {
      return Promise.all(slugs.map(slug => this.getViewCount(slug)));
    },

    async getViews(filters: BlogViewFilters): Promise<BlogView[]> {
      let views = Array.from(blogViews.values());

      // Apply filters
      if (filters.slug) {
        views = views.filter(view => view.slug === filters.slug);
      }

      if (filters.sessionId) {
        views = views.filter(view => view.sessionId === filters.sessionId);
      }

      if (filters.startDate) {
        views = views.filter(view => view.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        views = views.filter(view => view.timestamp <= filters.endDate!);
      }

      // Sort by timestamp (newest first)
      views.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      
      return views.slice(offset, offset + limit);
    },

    async getTotalViewCount(filters: Pick<BlogViewFilters, 'slug' | 'startDate' | 'endDate'>): Promise<number> {
      let views = Array.from(blogViews.values());

      if (filters.slug) {
        views = views.filter(view => view.slug === filters.slug);
      }

      if (filters.startDate) {
        views = views.filter(view => view.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        views = views.filter(view => view.timestamp <= filters.endDate!);
      }

      return views.length;
    },

    async getStats(): Promise<BlogViewStats> {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const allViews = Array.from(blogViews.values());
      const uniqueSessions = new Set(allViews.map(view => view.sessionId));

      const todayViews = allViews.filter(view => 
        new Date(view.timestamp) >= today
      );

      const weekViews = allViews.filter(view => 
        new Date(view.timestamp) >= weekAgo
      );

      const monthViews = allViews.filter(view => 
        new Date(view.timestamp) >= monthAgo
      );

      // Calculate top posts
      const postCounts = new Map<string, { total: number; unique: Set<string> }>();
      
      allViews.forEach(view => {
        if (!postCounts.has(view.slug)) {
          postCounts.set(view.slug, { total: 0, unique: new Set() });
        }
        const postData = postCounts.get(view.slug)!;
        postData.total++;
        postData.unique.add(view.sessionId);
      });

      const topPosts = Array.from(postCounts.entries())
        .map(([slug, data]) => ({
          slug,
          totalViews: data.total,
          uniqueViews: data.unique.size
        }))
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 10);

      return {
        totalViews: allViews.length,
        uniqueViews: uniqueSessions.size,
        viewsToday: todayViews.length,
        viewsThisWeek: weekViews.length,
        viewsThisMonth: monthViews.length,
        topPosts
      };
    },

    async deleteOldViews(daysOld: number = 365): Promise<number> {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const viewsToDelete = Array.from(blogViews.entries())
        .filter(([_, view]) => new Date(view.createdAt) < cutoffDate);

      viewsToDelete.forEach(([id, view]) => {
        blogViews.delete(id);
        sessionViews.delete(`${view.sessionId}:${view.slug}`);
      });

      return viewsToDelete.length;
    }
  };
}

export type MemoryBlogViewService = ReturnType<typeof createMemoryBlogViewService>;
export { createMemoryBlogViewService };