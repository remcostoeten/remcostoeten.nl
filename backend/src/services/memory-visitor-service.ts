import type { 
  Visitor, 
  BlogView, 
  CreateVisitorData, 
  CreateBlogViewData, 
  VisitorStats 
} from '../types/visitor';

// In-memory storage
const visitors: Visitor[] = [];
const blogViews: BlogView[] = [];

export function setupVisitorService() {
  return {
    async trackVisitor(data: CreateVisitorData): Promise<Visitor> {
      const now = new Date().toISOString();
      
      const existingVisitor = visitors.find(v => v.visitorId === data.visitorId);
      
      if (existingVisitor) {
        existingVisitor.isNewVisitor = false;
        existingVisitor.lastVisitAt = now;
        existingVisitor.totalVisits += 1;
        existingVisitor.userAgent = data.userAgent;
        existingVisitor.ipAddress = data.ipAddress;
        existingVisitor.updatedAt = now;
        return existingVisitor;
      } else {
        const newVisitor: Visitor = {
          id: crypto.randomUUID(),
          visitorId: data.visitorId,
          isNewVisitor: true,
          firstVisitAt: now,
          lastVisitAt: now,
          totalVisits: 1,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          createdAt: now,
          updatedAt: now,
        };
        visitors.push(newVisitor);
        return newVisitor;
      }
    },

    async trackBlogView(data: CreateBlogViewData): Promise<BlogView> {
      const now = new Date().toISOString();
      
      const existingView = blogViews.find(
        v => v.visitorId === data.visitorId && v.blogSlug === data.blogSlug
      );

      if (existingView) {
        existingView.viewCount += 1;
        existingView.lastViewedAt = now;
        existingView.updatedAt = now;
        return existingView;
      } else {
        const newView: BlogView = {
          id: crypto.randomUUID(),
          visitorId: data.visitorId,
          blogSlug: data.blogSlug,
          blogTitle: data.blogTitle,
          viewCount: 1,
          firstViewedAt: now,
          lastViewedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        blogViews.push(newView);
        return newView;
      }
    },

    async getVisitorStats(): Promise<VisitorStats> {
      const totalVisitors = visitors.length;
      const newVisitors = visitors.filter(v => v.isNewVisitor).length;
      const returningVisitors = totalVisitors - newVisitors;
      const totalBlogViews = blogViews.reduce((sum, view) => sum + view.viewCount, 0);
      const uniqueBlogViews = blogViews.length;

      const blogStats = blogViews.reduce((acc: any, view) => {
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
      }, {});

      const topBlogPosts = Object.values(blogStats)
        .map((stat: any) => ({
          slug: stat.slug,
          title: stat.title,
          viewCount: stat.viewCount,
          uniqueViewers: stat.uniqueViewers.size,
        }))
        .sort((a: any, b: any) => b.viewCount - a.viewCount)
        .slice(0, 10);

      const recentVisitors = visitors
        .sort((a, b) => new Date(b.lastVisitAt).getTime() - new Date(a.lastVisitAt).getTime())
        .slice(0, 10)
        .map(visitor => ({
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

    async getBlogViewCount(blogSlug: string) {
      const blogViewsForSlug = blogViews.filter(view => view.blogSlug === blogSlug);
      const totalViews = blogViewsForSlug.reduce((sum, view) => sum + view.viewCount, 0);
      const uniqueViewers = new Set(blogViewsForSlug.map(view => view.visitorId)).size;

      return {
        totalViews,
        uniqueViewers,
      };
    },

    async getVisitor(visitorId: string): Promise<Visitor | null> {
      return visitors.find(v => v.visitorId === visitorId) || null;
    },
  };
}