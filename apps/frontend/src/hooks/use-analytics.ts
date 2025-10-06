"use client";

import { useMemo, useCallback, useRef } from 'react';

type TVisitorData = {
  userAgent: string;
  acceptLanguage: string;
  screenResolution: string;
  timezone: string;
  platform: string;
  language: string;
  referrer: string;
};

type TPageviewData = {
  url: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: string;
};

type TAnalyticsStats = {
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

function getVisitorData(): TVisitorData {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server',
      acceptLanguage: 'en',
      screenResolution: '1920x1080',
      timezone: 'UTC',
      platform: 'server',
      language: 'en-US',
      referrer: '',
    };
  }

  return {
    userAgent: navigator.userAgent,
    acceptLanguage: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    language: navigator.language,
    referrer: document.referrer,
  };
}

function generateVisitorId(data: TVisitorData): string {
  if (typeof window === 'undefined') {
    return 'server-id';
  }

  // Try to get existing visitor ID from localStorage first
  const existingId = localStorage.getItem('analytics-visitor-id');
  if (existingId) {
    return existingId;
  }

  // Generate new ID - use crypto.randomUUID if available, fallback to enhanced fingerprint
  let newId: string;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    newId = crypto.randomUUID();
  } else {
    // Enhanced fingerprinting for older browsers - more stable fingerprint
    const fingerprint = [
      data.userAgent,
      data.acceptLanguage,
      data.screenResolution,
      data.timezone,
      data.platform,
      // Add canvas fingerprint for better uniqueness (if available)
      getCanvasFingerprint(),
      // Add timezone offset for additional uniqueness
      new Date().getTimezoneOffset().toString(),
    ].join('|');

    // Use crypto.subtle for better hashing if available
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Use Web Crypto API for better hashing
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(fingerprint);
      crypto.subtle.digest('SHA-256', dataBuffer).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        newId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
      });
    } else {
      // Fallback to simple hash
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      newId = Math.abs(hash).toString(16).substring(0, 16);
    }
  }

  localStorage.setItem('analytics-visitor-id', newId);
  return newId;
}

// Enhanced canvas fingerprinting for better uniqueness
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    // Draw some text with different fonts and styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Analytics fingerprint', 2, 2);
    ctx.font = '12px Verdana';
    ctx.fillText('Browser uniqueness', 4, 20);

    return canvas.toDataURL().slice(-20); // Last 20 chars for uniqueness
  } catch {
    return 'canvas-error';
  }
}

const DEFAULT_API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4001/api'
    : 'https://backend-thrumming-cloud-5273.fly.dev/api';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API_BASE;

export function useAnalytics() {
  const visitorData = useMemo(() => getVisitorData(), []);
  const visitorId = useMemo(() => generateVisitorId(visitorData), [visitorData]);

  // Cache for request deduplication - only initialize on client side
  const requestCacheRef = useRef<Map<string, Promise<any>> | null>(null);

  const getRequestCache = () => {
    if (typeof window === 'undefined') return null;

    if (!requestCacheRef.current) {
      requestCacheRef.current = new Map<string, Promise<any>>();
    }
    return requestCacheRef.current;
  };

  const trackPageview = useCallback(async (pageData?: Partial<TPageviewData>) => {
    if (typeof window === 'undefined') return null;

    const pageviewData: TPageviewData = {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer || undefined,
      userAgent: visitorData.userAgent,
      ...pageData,
    };

    try {
      const response = await fetch(`${API_BASE}/pageviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Screen-Resolution': visitorData.screenResolution,
          'X-Timezone': visitorData.timezone,
          'X-Platform': visitorData.platform,
        },
        body: JSON.stringify(pageviewData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error tracking pageview:', error);
      return null;
    }
  }, [visitorData.screenResolution, visitorData.timezone, visitorData.platform]);

  // Visitor tracking (for user identification)
  const trackVisitor = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/visitors/track-visitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Screen-Resolution': visitorData.screenResolution,
          'X-Timezone': visitorData.timezone,
          'X-Platform': visitorData.platform,
        },
        body: JSON.stringify({ visitorId, ...visitorData }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error tracking visitor:', error);
      return null;
    }
  }, [visitorData, visitorId]);

  // Blog-specific tracking
  const trackBlogView = useCallback(async (blogSlug: string, blogTitle: string) => {
    try {
      // Track visitor, pageview, and increment blog view count
      const [visitorResult, pageviewResult, blogViewResult] = await Promise.all([
        fetch(`${API_BASE}/visitors/track-blog-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Screen-Resolution': visitorData.screenResolution,
            'X-Timezone': visitorData.timezone,
            'X-Platform': visitorData.platform,
          },
          body: JSON.stringify({ visitorId, blogSlug, blogTitle }),
        }),
        trackPageview({ title: blogTitle }),
        fetch(`${API_BASE}/blog/analytics/${blogSlug}/view`, {
          method: 'POST',
          credentials: 'include',
        })
      ]);

      return {
        visitor: await visitorResult.json(),
        pageview: pageviewResult,
        blogView: await blogViewResult.json(),
      };
    } catch (error) {
      console.error('Error tracking blog view:', error);
      return null;
    }
  }, [visitorData.screenResolution, visitorData.timezone, visitorData.platform, visitorId, trackPageview]);

  // Get blog view count
  const getBlogViewCount = useCallback(async (blogSlug: string) => {
    try {
      const response = await fetch(`${API_BASE}/visitors/blog/${blogSlug}/views`);
      return await response.json();
    } catch (error) {
      console.error('Error getting blog view count:', error);
      return null;
    }
  }, []);

  // Get pageview statistics
  const getPageviewStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/pageviews/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error getting pageview stats:', error);
      return null;
    }
  }, []);

  // Get visitor statistics
  const getVisitorStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/visitors/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      return null;
    }
  }, []);

  // Get combined analytics stats with caching
  const getAnalyticsStats = useCallback(async (): Promise<TAnalyticsStats | null> => {
    const cacheKey = 'analytics-stats';
    const requestCache = getRequestCache();

    // Check if we already have a pending request (only on client side)
    if (requestCache && requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }

    const request = (async () => {
      try {
        const [pageviewsResult, visitorsResult] = await Promise.all([
          getPageviewStats(),
          getVisitorStats()
        ]);

        if (!pageviewsResult?.success || !visitorsResult?.success) {
          return null;
        }

        return {
          pageviews: pageviewsResult.data,
          visitors: visitorsResult.stats,
        };
      } catch (error) {
        console.error('Error getting combined analytics stats:', error);
        return null;
      } finally {
        // Clear cache after request completes
        const cache = getRequestCache();
        if (cache) {
          cache.delete(cacheKey);
        }
      }
    })();

    const cache = getRequestCache();
    if (cache) {
      cache.set(cacheKey, request);
    }
    return request;
  }, [getPageviewStats, getVisitorStats, getRequestCache]);

  // Auto-track page views with session deduplication
  const autoTrackPageview = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const sessionKey = `pageview-${window.location.pathname}`;
    const hasTracked = sessionStorage.getItem(sessionKey);

    if (!hasTracked) {
      await Promise.all([
        trackPageview(),
        trackVisitor()
      ]);
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [trackPageview, trackVisitor]);

  return {
    // Core tracking
    trackPageview,
    trackVisitor,
    trackBlogView,
    autoTrackPageview,

    // Data retrieval
    getBlogViewCount,
    getPageviewStats,
    getVisitorStats,
    getAnalyticsStats,

    // User info
    visitorId,
    visitorData,
  };
}

export type { TAnalyticsStats, TPageviewData, TVisitorData };
