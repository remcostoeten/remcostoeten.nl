import { useState, useEffect, useCallback } from 'react';
import { useAnalytics } from './use-analytics';

type TRealAnalyticsStats = {
  pageviews: {
    total: number;
    today: number;
    yesterday: number;
    thisWeek: number;
    uniqueUrls: number;
    topPages: Array<{ url: string; count: number }>;
  };
  visitors: {
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
  };
};

type TRealBlogStats = {
  [slug: string]: {
    totalViews: number;
    uniqueViewers: number;
    newVisitorViews: number;
    returningVisitorViews: number;
  };
};

export function useRealAnalytics() {
  const { getAnalyticsStats, getBlogViewCount } = useAnalytics();
  const [stats, setStats] = useState<TRealAnalyticsStats | null>(null);
  const [blogStats, setBlogStats] = useState<TRealBlogStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const analyticsData = await getAnalyticsStats();
      if (analyticsData) {
        setStats(analyticsData);
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [getAnalyticsStats]);

  const fetchBlogStats = useCallback(async (blogSlugs: string[]) => {
    try {
      const blogStatsPromises = blogSlugs.map(async (slug) => {
        const result = await getBlogViewCount(slug);
        return { slug, stats: result?.viewCount || { totalViews: 0, uniqueViewers: 0, newVisitorViews: 0, returningVisitorViews: 0 } };
      });

      const results = await Promise.all(blogStatsPromises);
      const blogStatsMap: TRealBlogStats = {};
      
      results.forEach(({ slug, stats }) => {
        blogStatsMap[slug] = stats;
      });

      setBlogStats(blogStatsMap);
    } catch (err) {
      console.error('Error fetching blog stats:', err);
    }
  }, [getBlogViewCount]);

  const refreshStats = useCallback(() => {
    fetchAnalyticsStats();
  }, [fetchAnalyticsStats]);

  useEffect(() => {
    fetchAnalyticsStats();
  }, [fetchAnalyticsStats]);

  return {
    stats,
    blogStats,
    loading,
    error,
    refreshStats,
    fetchBlogStats,
  };
}


