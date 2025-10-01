import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { pageviews } from '../schema/pageviews';
import type { 
  Pageview, 
  CreatePageviewData, 
  PageviewFilters, 
  PageviewStats 
} from '../types/pageview';

function createDatabasePageviewService() {
  return {
    async createPageview(data: CreatePageviewData): Promise<Pageview> {
      const now = new Date();
      
      const newPageview = await db
        .insert(pageviews)
        .values({
          id: crypto.randomUUID(),
          url: data.url,
          title: data.title,
          referrer: data.referrer,
          userAgent: data.userAgent,
          timestamp: data.timestamp || now,
          createdAt: now,
        })
        .returning();

      return newPageview[0];
    },

    async getPageviews(filters: PageviewFilters): Promise<Pageview[]> {
      let query = db.select().from(pageviews);

      if (filters.url) {
        query = query.where(eq(pageviews.url, filters.url));
      }

      const results = await query
        .orderBy(desc(pageviews.timestamp))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      return results;
    },

    async getTotalCount(filters: Pick<PageviewFilters, 'url'>): Promise<number> {
      let query = db.select({ count: sql<number>`count(*)` }).from(pageviews);

      if (filters.url) {
        query = query.where(eq(pageviews.url, filters.url));
      }

      const result = await query;
      return result[0]?.count || 0;
    },

    async getStats(): Promise<PageviewStats> {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalResult,
        todayResult,
        yesterdayResult,
        thisWeekResult,
        uniqueUrlsResult,
        topPagesResult
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(pageviews),
        db.select({ count: sql<number>`count(*)` }).from(pageviews)
          .where(gte(pageviews.timestamp, today)),
        db.select({ count: sql<number>`count(*)` }).from(pageviews)
          .where(and(
            gte(pageviews.timestamp, yesterday),
            lte(pageviews.timestamp, today)
          )),
        db.select({ count: sql<number>`count(*)` }).from(pageviews)
          .where(gte(pageviews.timestamp, weekAgo)),
        db.select({ count: sql<number>`count(distinct ${pageviews.url})` }).from(pageviews),
        db.select({
          url: pageviews.url,
          count: sql<number>`count(*)`
        })
        .from(pageviews)
        .groupBy(pageviews.url)
        .orderBy(desc(sql<number>`count(*)`))
        .limit(10)
      ]);

      return {
        total: totalResult[0]?.count || 0,
        today: todayResult[0]?.count || 0,
        yesterday: yesterdayResult[0]?.count || 0,
        thisWeek: thisWeekResult[0]?.count || 0,
        uniqueUrls: uniqueUrlsResult[0]?.count || 0,
        topPages: topPagesResult.map(row => ({
          url: row.url,
          count: row.count
        }))
      };
    },
  };
}

export type DatabasePageviewService = ReturnType<typeof createDatabasePageviewService>;
export { createDatabasePageviewService };


