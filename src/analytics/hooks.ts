import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { AnalyticsService } from './service';
import type { TAnalyticsFilters, TAnalyticsEvent } from './types';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

function getUserFingerprint(): string {
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
    navigator.hardwareConcurrency || 'unknown',
    typeof document.fonts !== 'undefined' ? 'fonts-api' : 'no-fonts-api',
  ].join('|');
  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36).padStart(8, '0');
}

function getUserId(): string {
  let userId = localStorage.getItem('analytics_user_id');
  
  if (!userId) {
    const fingerprint = getUserFingerprint();
    userId = `fp_${fingerprint}`;
    
    try {
      localStorage.setItem('analytics_user_id', userId);
    } catch (e) {
      console.debug('Could not store user ID in localStorage');
    }
  }
  
  return userId;
}

export function useAnalytics() {
  const queryClient = useQueryClient();
  const sessionId = useRef(getSessionId());

  const trackEventMutation = useMutation({
    mutationFn: async (event: Omit<TAnalyticsEvent, 'id' | 'timestamp'>) => {
      const eventData = {
        ...event,
        sessionId: sessionId.current,
        userId: getUserId(),
        userAgent: navigator.userAgent,
        ipAddress: undefined, 
      };
      
      return AnalyticsService.trackEvent(eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'realtime'] });
    }
  });

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
}

export function useAnalyticsMetrics(filters?: TAnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'metrics', filters],
    queryFn: () => AnalyticsService.getMetrics(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useRealTimeMetrics() {
  return useQuery({
    queryKey: ['analytics', 'realtime'],
    queryFn: () => AnalyticsService.getRealTimeMetrics(),
    refetchInterval: (query) => {
      if (document.hidden) {
        return 60 * 1000;
      }
      return 30 * 1000;
    },
    staleTime: 15 * 1000,
    gcTime: 2 * 60 * 1000, 
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useAnalyticsEvents(
  page: number = 1,
  limit: number = 50,
  filters?: TAnalyticsFilters
) {
  return useQuery({
    queryKey: ['analytics', 'events', page, limit, filters],
    queryFn: () => AnalyticsService.getEvents(page, limit, filters),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function usePageViewTracking() {
  const { trackPageView } = useAnalytics();
  const currentPath = useRef(window.location.pathname);
  const hasTrackedInitialView = useRef(false);
  const trackPageViewRef = useRef(trackPageView);

  useEffect(() => {
    trackPageViewRef.current = trackPageView;
  }, [trackPageView]);

  useEffect(() => {
    if (!hasTrackedInitialView.current) {
      trackPageViewRef.current(window.location.pathname, document.referrer);
      hasTrackedInitialView.current = true;
    }

    function handleLocationChange() {
      const newPath = window.location.pathname;
      if (newPath !== currentPath.current) {
        trackPageViewRef.current(newPath, currentPath.current);
        currentPath.current = newPath;
      }
    }

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
}

export function usePageCompletionTracking() {
  const { trackPageCompleted } = useAnalytics();
  const pageStartTime = useRef(Date.now());
  const hasTrackedCompletion = useRef(false);
  const trackPageCompletedRef = useRef(trackPageCompleted);

  useEffect(() => {
    trackPageCompletedRef.current = trackPageCompleted;
  }, [trackPageCompleted]);

  useEffect(() => {
    function handleScroll() {
      if (hasTrackedCompletion.current) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight > 0 && (scrollTop / docHeight) >= 0.9) {
        const timeOnPage = Date.now() - pageStartTime.current;
        trackPageCompletedRef.current(timeOnPage);
        hasTrackedCompletion.current = true;
      }
    }

    const timeoutId = setTimeout(() => {
      if (!hasTrackedCompletion.current) {
        const timeOnPage = Date.now() - pageStartTime.current;
        trackPageCompletedRef.current(timeOnPage, 'time-based');
        hasTrackedCompletion.current = true;
      }
    }, 2 * 60 * 1000);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
      
      pageStartTime.current = Date.now();
      hasTrackedCompletion.current = false;
    };
  }, []);
}
