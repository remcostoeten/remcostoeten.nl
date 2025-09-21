export interface BlogView {
  id: string;
  slug: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
  createdAt: string;
}

export interface CreateBlogViewData {
  slug: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp?: string;
}

export interface BlogViewFilters {
  slug?: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface BlogViewStats {
  totalViews: number;
  uniqueViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topPosts: Array<{
    slug: string;
    totalViews: number;
    uniqueViews: number;
  }>;
}

export interface BlogPostViewCount {
  slug: string;
  totalViews: number;
  uniqueViews: number;
}