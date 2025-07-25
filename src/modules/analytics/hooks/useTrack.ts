import { useCallback } from 'react';
import { AnalyticsService } from '../services/analyticsService';

// Simple tracking hook - just call track() with event name and optional data
type TTrackData = Record<string, string | number | boolean | string[]>;

export function useTrack() {
  const track = useCallback((event: string, data?: TTrackData) => {
    const sessionId = getSessionId();
    const page = window.location.pathname;
    const referrer = document.referrer;
    const userAgent = navigator.userAgent;
    
    const eventTypeMap: Record<string, string> = {
      'page': 'page_view',
      'click': 'button_click', 
      'project': 'project_view',
      'form': 'contact_form_submission',
      'scroll': 'scroll_depth',
      'link': 'external_link_click',
      'session': 'session_start',
      'skill': 'skill_hover'
    };

    const eventType = eventTypeMap[event] || event;
    
    AnalyticsService.trackEvent({
      eventType,
      page,
      referrer,
      userAgent,
      ipAddress: '',
      sessionId,
      data
    });
  }, []);

  const trackPage = useCallback((page?: string) => {
    track('page', { page: page || window.location.pathname });
  }, [track]);

  const trackClick = useCallback((element: string, data?: TTrackData) => {
    track('click', { element, ...data });
  }, [track]);

  const trackProject = useCallback((projectId: string, projectTitle: string) => {
    track('project', { projectId, projectTitle });
  }, [track]);

  const trackForm = useCallback((formType: string, success: boolean, data?: TTrackData) => {
    track('form', { formType, success, ...data });
  }, [track]);

  return {
    track,
    trackPage,
    trackClick,
    trackProject, 
    trackForm
  };
}

// Simple session management
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics-session');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('analytics-session', sessionId);
  }
  return sessionId;
}
