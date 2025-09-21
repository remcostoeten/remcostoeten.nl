import { eq, desc, sql, and, gte, lte, count, countDistinct } from 'drizzle-orm';
import { db } from '../db';
import { blogViews } from '../schema/blog-views';
import type { 
  BlogView, 
  CreateBlogViewData, 
  BlogViewFilters, 
  BlogViewStats,
  BlogPostViewCount
} from '../types/blog-view';

function createBlogViewService() {
  return {
    async recordView(data: CreateBlogViewData): Promise<{ success: boolean; isNewView: boolean; view?: BlogView }> {
      const now = new Date().toISOString();
      
      try {
        // Check if this session has already viewed this post
        const existingView = await db
          .select()
          .from(blogViews)
          .where(and(
            eq(blogViews.slug, data.slug),
            eq(blogViews.sessionId, data.sessionId)
          ))
          .limit(1);

        if (existingView.length > 0) {
          return {
            success: true,
            isNewView: false,
            view: existingView[0]
          };
        }

        // Record new view
        const newView = await db
          .insert(blogViews)
          .values({
            id: crypto.randomUUID(),
            slug: data.slug,
            sessionId: data.sessionId,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            referrer: data.referrer,
            timestamp: data.timestamp || now,
            createdAt: now,
          })
          .returning();

        return {
          success: true,
          isNewView: true,
          view: newView[0]
        };
      } catch (error) {
        console.error('Error recording blog view:', error);
        return {
          success: false,
          isNewView: false
        };
      }
    },

    async getViewCount(slug: string): Promise<BlogPostViewCount> {
      const [totalResult, uniqueResult] = await Promise.all([
        db
          .select({ count: count() })
          .from(blogViews)
          .where(eq(blogViews.slug, slug)),
        db
          .select({ count: countDistinct(blogViews.sessionId) })
          .from(blogViews)
          .where(eq(blogViews.slug, slug))
      ]);

      return {
        slug,
        totalViews: totalResult[0]?.count || 0,
        uniqueViews: uniqueResult[0]?.count || 0
      };
    },

    async getMultipleViewCounts(slugs: string[]): Promise<BlogPostViewCount[]> {
      if (slugs.length === 0) return [];

      const results = await Promise.all(
        slugs.map(slug => this.getViewCount(slug))
      );

      return results;
    },

    async getViews(filters: BlogViewFilters): Promise<BlogView[]> {
      let query = db.select().from(blogViews);

      const conditions = [];

      if (filters.slug) {
        conditions.push(eq(blogViews.slug, filters.slug));
      }

      if (filters.sessionId) {
        conditions.push(eq(blogViews.sessionId, filters.sessionId));
      }

      if (filters.startDate) {
        conditions.push(gte(blogViews.timestamp, filters.startDate));
      }

      if (filters.endDate) {
        conditions.push(lte(blogViews.timestamp, filters.endDate));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query
        .orderBy(desc(blogViews.timestamp))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      return results;
    },

    async getTotalViewCount(filters: Pick<BlogViewFilters, 'slug' | 'startDate' | 'endDate'>): Promise<number> {
      let query = db.select({ count: count() }).from(blogViews);

      const conditions = [];

      if (filters.slug) {
        conditions.push(eq(blogViews.slug, filters.slug));
      }

      if (filters.startDate) {
        conditions.push(gte(blogViews.timestamp, filters.startDate));
      }

      if (filters.endDate) {
        conditions.push(lte(blogViews.timestamp, filters.endDate));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query;
      return result[0]?.count || 0;
    },

    async getStats(): Promise<BlogViewStats> {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalResult,
        uniqueResult,
        todayResult,
        thisWeekResult,
        thisMonthResult,
        topPostsResult
      ] = await Promise.all([
        db.select({ count: count() }).from(blogViews),
        db.select({ count: countDistinct(blogViews.sessionId) }).from(blogViews),
        db.select({ count: count() }).from(blogViews)
          .where(gte(blogViews.timestamp, today.toISOString())),
        db.select({ count: count() }).from(blogViews)
          .where(gte(blogViews.timestamp, weekAgo.toISOString())),
        db.select({ count: count() }).from(blogViews)
          .where(gte(blogViews.timestamp, monthAgo.toISOString())),
        db.select({
          slug: blogViews.slug,
          totalViews: count(),
          uniqueViews: countDistinct(blogViews.sessionId)
        })
        .from(blogViews)
        .groupBy(blogViews.slug)
        .orderBy(desc(count()))
        .limit(10)
      ]);

      return {
        totalViews: totalResult[0]?.count || 0,
        uniqueViews: uniqueResult[0]?.count || 0,
        viewsToday: todayResult[0]?.count || 0,
        viewsThisWeek: thisWeekResult[0]?.count || 0,
        viewsThisMonth: thisMonthResult[0]?.count || 0,
        topPosts: topPostsResult.map(row => ({
          slug: row.slug,
          totalViews: row.totalViews,
          uniqueViews: row.uniqueViews
        }))
      };
    },

    async deleteOldViews(daysOld: number = 365): Promise<number> {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await db
        .delete(blogViews)
        .where(lte(blogViews.createdAt, cutoffDate.toISOString()));

      return result.rowCount || 0;
    }
  };
}

export type BlogViewService = ReturnType<typeof createBlogViewService>;
export { createBlogViewService };