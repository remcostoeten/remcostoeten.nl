import React, { createContext, useContext, useEffect } from 'react';
import { 
  usePageViewTracking, 
  usePageCompletionTracking, 
  useAnalytics 
} from './hooks';

type TAnalyticsContextType = {
  trackPageView: (page: string, referrer?: string) => void;
  trackButtonClick: (buttonText: string, buttonId?: string, section?: string) => void;
  trackProjectView: (projectId: string, projectTitle: string) => void;
  trackContactFormSubmission: (success: boolean, errors?: string[]) => void;
  trackPageCompleted: (timeOnPage: number, section?: string) => void;
  trackExternalLinkClick: (url: string, linkText: string, section?: string) => void;
  isTracking: boolean;
}

const AnalyticsContext = createContext<TAnalyticsContextType | undefined>(undefined);

type TProps = {
  children: React.ReactNode;
  enableAutoTracking?: boolean;
  excludedPaths?: string[];
}

function shouldExcludeFromTracking(pathname: string, excludedPaths: string[] = []): boolean {
  const defaultExcludedPaths = [
    '/analytics',
    '/admin',
    '/dev',
    '/debug'
  ];
  
  const allExcludedPaths = [...defaultExcludedPaths, ...excludedPaths];
  
  return allExcludedPaths.some(path => pathname.startsWith(path));
}

export function AnalyticsProvider({ 
  children, 
  enableAutoTracking = true,
  excludedPaths = []
}: TProps) {
  const analytics = useAnalytics();
  
  usePageViewTracking();
  usePageCompletionTracking();

  useEffect(() => {
    if (!enableAutoTracking) return;

    function handleLinkClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        
        if (url.origin !== window.location.origin) {
          const linkText = link.textContent?.trim() || link.href;
          const section = link.closest('[data-section]')?.getAttribute('data-section');
          
          analytics.trackExternalLinkClick(url.href, linkText, section || undefined);
        }
      }
    }

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [analytics, enableAutoTracking]);

  useEffect(() => {
    if (!enableAutoTracking) return;
    if (shouldExcludeFromTracking(window.location.pathname, excludedPaths)) return;

    function handleButtonClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const button = target.closest('button');
      
      if (button) {
        const buttonText = button.textContent?.trim() || button.getAttribute('aria-label') || 'Unknown Button';
        const buttonId = button.id;
        const section = button.closest('[data-section]')?.getAttribute('data-section');
        
        analytics.trackButtonClick(buttonText, buttonId || undefined, section || undefined);
      }
    }

    document.addEventListener('click', handleButtonClick, true);

    return () => {
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [analytics, enableAutoTracking, excludedPaths]);

  const contextValue: TAnalyticsContextType = {
    trackPageView: analytics.trackPageView,
    trackButtonClick: analytics.trackButtonClick,
    trackProjectView: analytics.trackProjectView,
    trackContactFormSubmission: analytics.trackContactFormSubmission,
    trackPageCompleted: analytics.trackPageCompleted,
    trackExternalLinkClick: analytics.trackExternalLinkClick,
    isTracking: analytics.isTracking,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext(): TAnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}
