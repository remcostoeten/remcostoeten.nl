import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { visitors, blogViews } from '../schema/visitors';
import { enhanceVisitorData } from '../utils/geolocation';
import type {
  Visitor,
  BlogView,
  CreateVisitorData,
  CreateBlogViewData,
  VisitorStats,
  BlogViewFilters
} from '../types/visitor';

function setupVisitorService() {

  return {
    // Visitor management
    async trackVisitor(data: CreateVisitorData): Promise<Visitor> {
      const now = new Date();

      // Enhance visitor data with geolocation and device info
      const enhancedData = await enhanceVisitorData(data);

      // Check if visitor already exists
      const existingVisitor = await db
        .select()
        .from(visitors)
        .where(eq(visitors.visitorId, data.visitorId))
        .limit(1);

      if (existingVisitor.length > 0) {
        // Update existing visitor with enhanced data
        const updatedVisitor = await db
          .update(visitors)
          .set({
            isNewVisitor: false,
            lastVisitAt: now,
            totalVisits: existingVisitor[0].totalVisits + 1,
            userAgent: enhancedData.userAgent,
            ipAddress: enhancedData.ipAddress,
            country: enhancedData.country,
            region: enhancedData.region,
            city: enhancedData.city,
            timezone: enhancedData.timezone,
            language: enhancedData.language,
            screenResolution: enhancedData.screenResolution,
            platform: enhancedData.platform,
            browser: enhancedData.browser,
            os: enhancedData.os,
            deviceType: enhancedData.deviceType,
            referrer: enhancedData.referrer,
            updatedAt: now,
          })
          .where(eq(visitors.id, existingVisitor[0].id))
          .returning();

        return updatedVisitor[0];
      } else {
        // Create new visitor with enhanced data
        const newVisitor = await db
          .insert(visitors)
          .values({
            id: crypto.randomUUID(),
            visitorId: enhancedData.visitorId,
            isNewVisitor: true,
            firstVisitAt: now,
            lastVisitAt: now,
            totalVisits: 1,
            userAgent: enhancedData.userAgent,
            ipAddress: enhancedData.ipAddress,
            country: enhancedData.country,
            region: enhancedData.region,
            city: enhancedData.city,
            timezone: enhancedData.timezone,
            language: enhancedData.language,
            screenResolution: enhancedData.screenResolution,
            platform: enhancedData.platform,
            browser: enhancedData.browser,
            os: enhancedData.os,
            deviceType: enhancedData.deviceType,
            referrer: enhancedData.referrer,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return newVisitor[0];
      }
    },

    // Blog view tracking
    async trackBlogView(data: CreateBlogViewData): Promise<BlogView> {
      const now = new Date();

      // Check if this visitor has already viewed this blog
      const existingView = await db
        .select()
        .from(blogViews)
        .where(
          and(
            eq(blogViews.visitorId, data.visitorId),
            eq(blogViews.blogSlug, data.blogSlug)
          )
        )
        .limit(1);

      if (existingView.length > 0) {
        // Update existing view count
        const updatedView = await db
          .update(blogViews)
          .set({
            viewCount: existingView[0].viewCount + 1,
            lastViewedAt: now,
            updatedAt: now,
          })
          .where(eq(blogViews.id, existingView[0].id))
          .returning();

        return updatedView[0];
      } else {
        // Create new blog view
        const newView = await db
          .insert(blogViews)
          .values({
            id: crypto.randomUUID(),
            visitorId: data.visitorId,
            blogSlug: data.blogSlug,
            blogTitle: data.blogTitle,
            viewCount: 1,
            firstViewedAt: now,
            lastViewedAt: now,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return newView[0];
      }
    },

    // Get visitor stats
    async getVisitorStats(): Promise<VisitorStats> {
      // Get all visitors
      const allVisitors = await db.select().from(visitors) as unknown as Visitor[];

      // Get all blog views
      const allBlogViews = await db.select().from(blogViews) as unknown as BlogView[];

      // Calculate stats
      const totalVisitors = allVisitors.length;
      const newVisitors = allVisitors.filter((v: Visitor) => v.isNewVisitor).length;
      const returningVisitors = totalVisitors - newVisitors;
      const totalBlogViews = allBlogViews.reduce((sum: number, view: BlogView) => sum + view.viewCount, 0);
      const uniqueBlogViews = allBlogViews.length;

      // Get top blog posts
      const blogStats = allBlogViews.reduce(
        (
          acc: Record<string, { slug: string; title: string; viewCount: number; uniqueViewers: Set<string> }>,
          view: BlogView
        ) => {
          if (!acc[view.blogSlug]) {
            acc[view.blogSlug] = {
              slug: view.blogSlug,
              title: view.blogTitle,
              viewCount: 0,
              uniqueViewers: new Set(),
            };
          }
          acc[view.blogSlug].viewCount += view.viewCount;
          acc[view.blogSlug].uniqueViewers.add(view.visitorId);
          return acc;
        },
        {} as Record<string, { slug: string; title: string; viewCount: number; uniqueViewers: Set<string> }>
      );

      const topBlogPosts = (Object.values(blogStats) as Array<{ slug: string; title: string; viewCount: number; uniqueViewers: Set<string> }>)
        .map((stat: { slug: string; title: string; viewCount: number; uniqueViewers: Set<string> }) => ({
          slug: stat.slug,
          title: stat.title,
          viewCount: stat.viewCount,
          uniqueViewers: stat.uniqueViewers.size,
        }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10);

      // Get recent visitors
      const recentVisitors = allVisitors
        .sort((a: Visitor, b: Visitor) => new Date(b.lastVisitAt).getTime() - new Date(a.lastVisitAt).getTime())
        .slice(0, 10)
        .map((visitor: Visitor) => ({
          visitorId: visitor.visitorId,
          isNewVisitor: visitor.isNewVisitor,
          totalVisits: visitor.totalVisits,
          lastVisitAt: visitor.lastVisitAt,
        }));

      return {
        totalVisitors,
        newVisitors,
        returningVisitors,
        totalBlogViews,
        uniqueBlogViews,
        topBlogPosts,
        recentVisitors,
      };
    },

    // Get blog view count for a specific blog
    async getBlogViewCount(blogSlug: string): Promise<{
      totalViews: number;
      uniqueViewers: number;
      newVisitorViews: number;
      returningVisitorViews: number;
    }> {
      const allBlogViews = await db.select().from(blogViews);
      const allVisitors = await db.select().from(visitors);

      const blogViewsForSlug = allBlogViews.filter((view: BlogView) => view.blogSlug === blogSlug);
      const totalViews = blogViewsForSlug.reduce((sum: number, view: BlogView) => sum + view.viewCount, 0);
      const uniqueViewers = new Set(blogViewsForSlug.map((view: BlogView) => view.visitorId)).size;

      // Calculate new vs returning visitor views
      let newVisitorViews = 0;
      let returningVisitorViews = 0;

      for (const view of blogViewsForSlug) {
        const visitor = allVisitors.find((v: Visitor) => v.visitorId === view.visitorId);
        if (visitor) {
          if (visitor.isNewVisitor) {
            newVisitorViews += view.viewCount;
          } else {
            returningVisitorViews += view.viewCount;
          }
        }
      }

      return {
        totalViews,
        uniqueViewers,
        newVisitorViews,
        returningVisitorViews,
      };
    },

    // Get visitor by ID
    async getVisitor(visitorId: string): Promise<Visitor | null> {
      const result = await db
        .select()
        .from(visitors)
        .where(eq(visitors.visitorId, visitorId))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    },
  };
}

export type VisitorService = ReturnType<typeof setupVisitorService>;
export { setupVisitorService };
