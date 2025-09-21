'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewsService, ViewCount } from '@/services/views-service';

export function useMultipleViewCounts(slugs: string[]) {
  const [viewCounts, setViewCounts] = useState<Record<string, ViewCount>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize slugs to prevent unnecessary re-renders
  const memoizedSlugs = useMemo(() => slugs, [slugs.join(',')]);

  const loadViewCounts = useCallback(async () => {
    if (memoizedSlugs.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const counts = await ViewsService.getMultipleViewCounts(memoizedSlugs);
      setViewCounts(counts);
    } catch (err) {
      console.error('Error loading view counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load view counts');
    } finally {
      setLoading(false);
    }
  }, [memoizedSlugs]);

  useEffect(() => {
    loadViewCounts();
  }, [loadViewCounts]);

  const getViewCount = useCallback((slug: string) => {
    return viewCounts[slug]?.totalViews || 0;
  }, [viewCounts]);

  const getUniqueViewCount = useCallback((slug: string) => {
    return viewCounts[slug]?.uniqueViews || 0;
  }, [viewCounts]);

  const getFullViewCount = useCallback((slug: string) => {
    return viewCounts[slug] || { slug, totalViews: 0, uniqueViews: 0 };
  }, [viewCounts]);

  const getFormattedViewCount = useCallback((slug: string) => {
    const viewCount = viewCounts[slug];
    return ViewsService.formatViewCount(viewCount || { slug, totalViews: 0, uniqueViews: 0 });
  }, [viewCounts]);

  return {
    viewCounts,
    loading,
    error,
    getViewCount,
    getUniqueViewCount,
    getFullViewCount,
    getFormattedViewCount,
    refreshViewCounts: loadViewCounts
  };
}