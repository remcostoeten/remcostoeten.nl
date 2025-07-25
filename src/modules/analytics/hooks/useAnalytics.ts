import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { AnalyticsService } from '../services/analyticsService';
import type { AnalyticsFilters, AnalyticsEvent } from '../types';
import { shouldExcludeFromTracking } from '../config/excluded-paths';

// Session management
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

const getUserFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Analytics fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || '',
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.cookieEnabled,
    navigator.doNotTrack || 'unknown',
    canvas.toDataURL(),
    // Hardware concurrency (CPU cores)
    navigator.hardwareConcurrency || 'unknown',
    // Available fonts detection (simplified)
    typeof document.fonts !== 'undefined' ? 'fonts-api' : 'no-fonts-api',
  ].join('|');
  
  // Create a more stable hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).padStart(8, '0');
};

// Get or create persistent user ID (survives incognito/different sessions)
const getUserId = (): string => {
  // Try to get from localStorage first (persists across regular sessions)
  let userId = localStorage.getItem('analytics_user_id');
  
  if (!userId) {
    // Fallback to fingerprint-based ID
    const fingerprint = getUserFingerprint();
    userId = `fp_${fingerprint}`;
    
    // Try to store in localStorage (won't work in incognito but that's ok)
    try {
      localStorage.setItem('analytics_user_id', userId);
    } catch (e) {
      // Incognito mode or storage disabled
      console.debug('Could not store user ID in localStorage');
    }
  }
  
  return userId;
};

// Main analytics hook
export const useAnalytics = () => {
  const queryClient = useQueryClient();
  const sessionId = useRef(getSessionId());

  // Track event mutation
  const trackEventMutation = useMutation({
    mutationFn: async (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
      const eventData = {
        ...event,
        sessionId: sessionId.current,
        userId: getUserId(), // Add persistent user ID
        userAgent: navigator.userAgent,
        // In a real app, you'd get this from your server
        ipAddress: undefined, 
      };
      
      return AnalyticsService.trackEvent(eventData);
    },
    onSuccess: () => {
      // Invalidate real-time metrics to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['analytics', 'realtime'] });
    }
  });

  // Convenience methods for common events
  const trackPageView = useCallback((page: string, referrer?: string) => {
    trackEventMutation.mutate({
      eventType: 'page_view',
      page,
      referrer,
    });
  }, [trackEventMutation]);

  const trackButtonClick = useCallback((buttonText: string, buttonId?: string, section?: string) => {
    if (shouldExcludeFromTracking(window.location.pathname)) return;
    
    trackEventMutation.mutate({
      eventType: 'button_click',
      page: window.location.pathname,
      data: {
        buttonText,
        buttonId,
        section,
      },
    });
  }, [trackEventMutation]);

  const trackProjectView = useCallback((projectId: string, projectTitle: string) => {
    trackEventMutation.mutate({
      eventType: 'project_view',
      page: window.location.pathname,
      data: {
        projectId,
        projectTitle,
      },
    });
  }, [trackEventMutation]);

  const trackContactFormSubmission = useCallback((success: boolean, errors?: string[]) => {
    trackEventMutation.mutate({
      eventType: 'contact_form_submission',
      page: window.location.pathname,
      data: {
        success,
        errors,
      },
    });
  }, [trackEventMutation]);

  const trackPageCompleted = useCallback((timeOnPage: number, section?: string) => {
    trackEventMutation.mutate({
      eventType: 'page_completed',
      page: window.location.pathname,
      data: {
        timeOnPage,
        section,
      },
    });
  }, [trackEventMutation]);

  const trackExternalLinkClick = useCallback((url: string, linkText: string, section?: string) => {
    trackEventMutation.mutate({
      eventType: 'external_link_click',
      page: window.location.pathname,
      data: {
        url,
        linkText,
        section,
      },
    });
  }, [trackEventMutation]);

  // Track session start on mount
  const hasTrackedSessionStart = useRef(false);
  useEffect(() => {
    if (!hasTrackedSessionStart.current) {
      trackEventMutation.mutate({
        eventType: 'session_start',
        page: window.location.pathname,
        referrer: document.referrer,
        data: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenWidth: screen.width,
          screenHeight: screen.height,
          userAgent: navigator.userAgent,
        },
      });
      hasTrackedSessionStart.current = true;
    }
  }, [trackEventMutation]);

  return {
    trackPageView,
    trackButtonClick,
    trackProjectView,
    trackContactFormSubmission,
    trackPageCompleted,
    trackExternalLinkClick,
    isTracking: trackEventMutation.isPending,
  };
};

// Hook for fetching analytics metrics
export const useAnalyticsMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'metrics', filters],
    queryFn: () => AnalyticsService.getMetrics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - matches server cache
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Hook for real-time metrics
export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: () => AnalyticsService.getRealTimeMetrics(),
    refetchInterval: (query) => {
      // Continue polling even when tab is hidden, but at a slower rate
      if (document.hidden) {
        // Poll every 60 seconds when tab is hidden
        return 60 * 1000;
      }
      // Poll every 30 seconds when tab is visible
      return 30 * 1000;
    },
    staleTime: 15 * 1000, // Cache for 15 seconds - matches server cache
    gcTime: 2 * 60 * 1000, // 2 minutes 
    refetchOnWindowFocus: true, // Refresh when tab becomes visible
    refetchOnReconnect: true, // Refresh when connection is restored
  });
};

// Hook for paginated events
export const useAnalyticsEvents = (
  page: number = 1,
  limit: number = 50,
  filters?: AnalyticsFilters
) => {
  return useQuery({
    queryKey: ['analytics', 'events', page, limit, filters],
    queryFn: () => AnalyticsService.getEvents(page, limit, filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Hook for automatic page view tracking
export const usePageViewTracking = () => {
  const { trackPageView } = useAnalytics();
  const currentPath = useRef(window.location.pathname);
  const hasTrackedInitialView = useRef(false);
  const trackPageViewRef = useRef(trackPageView);

  // Update ref when trackPageView changes
  useEffect(() => {
    trackPageViewRef.current = trackPageView;
  }, [trackPageView]);

  useEffect(() => {
    // Only track initial page view once and exclude analytics paths
    if (!hasTrackedInitialView.current && !shouldExcludeFromTracking(window.location.pathname)) {
      trackPageViewRef.current(window.location.pathname, document.referrer);
      hasTrackedInitialView.current = true;
    }

    // Track navigation changes (for SPA)
    const handleLocationChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath.current && !shouldExcludeFromTracking(newPath)) {
        trackPageViewRef.current(newPath, currentPath.current);
        currentPath.current = newPath;
      }
    };

    // Listen for browser navigation
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
};

// Simple page completion tracking - tracks when user reaches bottom or spends significant time
export const usePageCompletionTracking = () => {
  const { trackPageCompleted } = useAnalytics();
  const pageStartTime = useRef(Date.now());
  const hasTrackedCompletion = useRef(false);
  const trackPageCompletedRef = useRef(trackPageCompleted);

  useEffect(() => {
    trackPageCompletedRef.current = trackPageCompleted;
  }, [trackPageCompleted]);

  useEffect(() => {
    if (shouldExcludeFromTracking(window.location.pathname)) return;

    const handleScroll = () => {
      if (hasTrackedCompletion.current) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Track completion when user reaches 90% of page
      if (docHeight > 0 && (scrollTop / docHeight) >= 0.9) {
        const timeOnPage = Date.now() - pageStartTime.current;
        trackPageCompletedRef.current(timeOnPage);
        hasTrackedCompletion.current = true;
      }
    };

    // Also track if user stays on page for 2+ minutes (engaged user)
    const timeoutId = setTimeout(() => {
      if (!hasTrackedCompletion.current) {
        const timeOnPage = Date.now() - pageStartTime.current;
        trackPageCompletedRef.current(timeOnPage, 'time-based');
        hasTrackedCompletion.current = true;
      }
    }, 2 * 60 * 1000); // 2 minutes

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
      
      // Reset for next page
      pageStartTime.current = Date.now();
      hasTrackedCompletion.current = false;
    };
  }, []);
};
