'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewsService, ViewCount } from '@/services/views-service';

export interface UseMultipleViewCountsOptions {
  // Whether to automatically refresh counts periodically
  autoRefresh?: boolean;
  // Refresh interval in milliseconds
  refreshInterval?: number;
}

export function useMultipleViewCounts(
  slugs: string[],
  options: UseMultipleViewCountsOptions = {}
) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [viewCounts, setViewCounts] = useState<Record<string, ViewCount>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a stable reference for slugs to prevent unnecessary re-renders
  const stableSlugs = useMemo(() => slugs, [slugs.join(',')]);

  // Load view counts for all slugs
  const loadViewCounts = useCallback(async () => {
    if (stableSlugs.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const counts = await ViewsService.getMultipleViewCounts(stableSlugs);
      setViewCounts(counts);
    } catch (err) {
      console.error('Error loading multiple view counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load view counts');
    } finally {
      setLoading(false);
    }
  }, [stableSlugs]);

  // Get view count for a specific slug
  const getViewCount = useCallback((slug: string): ViewCount => {
    return viewCounts[slug] || {
      slug,
      totalViews: 0,
      uniqueViews: 0
    };
  }, [viewCounts]);

  // Get formatted view count for display
  const getFormattedViewCount = useCallback((slug: string): string => {
    const viewCount = getViewCount(slug);
    return ViewsService.formatViewCount(viewCount);
  }, [getViewCount]);

  // Load view counts on mount and when slugs change
  useEffect(() => {
    loadViewCounts();
  }, [loadViewCounts]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || loading) return;

    const interval = setInterval(() => {
      loadViewCounts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, loadViewCounts]);

  return {
    viewCounts,
    loading,
    error,
    getViewCount,
    getFormattedViewCount,
    refreshViewCounts: loadViewCounts,
    totalViews: Object.values(viewCounts).reduce((sum, count) => sum + count.totalViews, 0),
    totalUniqueViews: Object.values(viewCounts).reduce((sum, count) => sum + count.uniqueViews, 0),
  };
}