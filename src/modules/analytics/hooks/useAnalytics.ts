import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { AnalyticsService } from '../services/analyticsService';
import type { AnalyticsFilters, AnalyticsEvent } from '../types';

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
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).slice(0, 32);
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

  const trackSkillHover = useCallback((skillName: string, skillCategory: string) => {
    trackEventMutation.mutate({
      eventType: 'skill_hover',
      page: window.location.pathname,
      data: {
        skillName,
        skillCategory,
      },
    });
  }, [trackEventMutation]);

  const trackScrollDepth = useCallback((depth: number, section?: string) => {
    trackEventMutation.mutate({
      eventType: 'scroll_depth',
      page: window.location.pathname,
      data: {
        depth,
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
  useEffect(() => {
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
  }, [trackEventMutation]);

  return {
    trackPageView,
    trackButtonClick,
    trackProjectView,
    trackContactFormSubmission,
    trackSkillHover,
    trackScrollDepth,
    trackExternalLinkClick,
    isTracking: trackEventMutation.isPending,
  };
};

// Hook for fetching analytics metrics
export const useAnalyticsMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', 'metrics', filters],
    queryFn: () => AnalyticsService.getMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for real-time metrics
export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: () => AnalyticsService.getRealTimeMetrics(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 0,
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
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for automatic page view tracking
export const usePageViewTracking = () => {
  const { trackPageView } = useAnalytics();
  const currentPath = useRef(window.location.pathname);

  useEffect(() => {
    // Track initial page view
    trackPageView(window.location.pathname, document.referrer);

    // Track navigation changes (for SPA)
    const handleLocationChange = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath.current) {
        trackPageView(newPath, currentPath.current);
        currentPath.current = newPath;
      }
    };

    // Listen for browser navigation
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [trackPageView]);
};

// Hook for scroll depth tracking
export const useScrollDepthTracking = (thresholds: number[] = [25, 50, 75, 90, 100]) => {
  const { trackScrollDepth } = useAnalytics();
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold);
          trackScrollDepth(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Reset tracked depths when component unmounts
      trackedDepths.current.clear();
    };
  }, [trackScrollDepth, thresholds]);
};
