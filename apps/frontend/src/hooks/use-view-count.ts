'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ViewsService, ViewCount } from '@/services/views-service';

export interface UseViewCountOptions {
  // Whether to automatically increment view count on mount
  autoIncrement?: boolean;
  // Delay before incrementing (to avoid counting quick bounces)
  incrementDelay?: number;
}

export function useViewCount(slug: string, options: UseViewCountOptions = {}) {
  const { autoIncrement = false, incrementDelay = 2000 } = options;
  
  const [viewCount, setViewCount] = useState<ViewCount>({
    slug,
    totalViews: 0,
    uniqueViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasIncrementedRef = useRef(false);

  // Load initial view count
  const loadViewCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('View count loading timeout')), 5000)
      );

      const count = await Promise.race([
        ViewsService.getViewCount(slug),
        timeoutPromise
      ]) as ViewCount;

      setViewCount(count);
    } catch (err) {
      console.error('Error loading view count:', err);
      setError(err instanceof Error ? err.message : 'Failed to load view count');
      // Set default values on error
      setViewCount({ slug, totalViews: 0, uniqueViews: 0 });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Record view (only increments if new session)
  const recordView = useCallback(async () => {
    try {
      const result = await ViewsService.recordView(slug);
      setViewCount(result.viewCount);
      return result;
    } catch (err) {
      console.error('Error recording view:', err);
      setError(err instanceof Error ? err.message : 'Failed to record view');
      return {
        success: false,
        isNewView: false,
        viewCount
      };
    }
  }, [slug, viewCount]);

  // Load view count on mount
  useEffect(() => {
    loadViewCount();
  }, [loadViewCount]);

  // Auto-record view if enabled
  useEffect(() => {
    if (!autoIncrement || loading || hasIncrementedRef.current) return;

    const timer = setTimeout(() => {
      hasIncrementedRef.current = true;
      recordView();
    }, incrementDelay);

    return () => clearTimeout(timer);
  }, [autoIncrement, incrementDelay, loading, recordView]);

  return {
    viewCount: viewCount.totalViews,
    uniqueViews: viewCount.uniqueViews,
    fullViewCount: viewCount,
    loading,
    error,
    recordView,
    refreshViewCount: loadViewCount,
    formattedViewCount: ViewsService.formatViewCount(viewCount)
  };
}