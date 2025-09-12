export interface Visitor {
  id: string;
  visitorId: string; // Unique identifier for the visitor (fingerprint)
  isNewVisitor: boolean;
  firstVisitAt: string;
  lastVisitAt: string;
  totalVisits: number;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogView {
  id: string;
  visitorId: string;
  blogSlug: string;
  blogTitle: string;
  viewCount: number; // How many times this visitor viewed this specific blog
  firstViewedAt: string;
  lastViewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitorData {
  visitorId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateBlogViewData {
  visitorId: string;
  blogSlug: string;
  blogTitle: string;
}

export interface VisitorStats {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  totalBlogViews: number;
  uniqueBlogViews: number;
  topBlogPosts: Array<{
    slug: string;
    title: string;
    viewCount: number;
    uniqueViewers: number;
  }>;
  recentVisitors: Array<{
    visitorId: string;
    isNewVisitor: boolean;
    totalVisits: number;
    lastVisitAt: string;
  }>;
}

export interface BlogViewFilters {
  blogSlug?: string;
  visitorId?: string;
  limit?: number;
  offset?: number;
}
