import React, { createContext, useContext, useEffect } from 'react';
import { 
  usePageViewTracking, 
  useScrollDepthTracking, 
  useAnalytics 
} from '../hooks/useAnalytics';

interface AnalyticsContextType {
  trackPageView: (page: string, referrer?: string) => void;
  trackButtonClick: (buttonText: string, buttonId?: string, section?: string) => void;
  trackProjectView: (projectId: string, projectTitle: string) => void;
  trackContactFormSubmission: (success: boolean, errors?: string[]) => void;
  trackSkillHover: (skillName: string, skillCategory: string) => void;
  trackScrollDepth: (depth: number, section?: string) => void;
  trackExternalLinkClick: (url: string, linkText: string, section?: string) => void;
  isTracking: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  enableAutoTracking?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  enableAutoTracking = true 
}) => {
  const analytics = useAnalytics();
  
  // Enable automatic page view tracking
  if (enableAutoTracking) {
    usePageViewTracking();
    useScrollDepthTracking();
  }

  // Enhanced external link tracking
  useEffect(() => {
    if (!enableAutoTracking) return;

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        
        // Check if it's an external link
        if (url.origin !== window.location.origin) {
          const linkText = link.textContent?.trim() || link.href;
          const section = link.closest('[data-section]')?.getAttribute('data-section');
          
          analytics.trackExternalLinkClick(url.href, linkText, section);
        }
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [analytics, enableAutoTracking]);

  // Enhanced button tracking
  useEffect(() => {
    if (!enableAutoTracking) return;

    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button');
      
      if (button) {
        const buttonText = button.textContent?.trim() || button.getAttribute('aria-label') || 'Unknown Button';
        const buttonId = button.id;
        const section = button.closest('[data-section]')?.getAttribute('data-section');
        
        analytics.trackButtonClick(buttonText, buttonId, section);
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleButtonClick, true);

    return () => {
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [analytics, enableAutoTracking]);

  const contextValue: AnalyticsContextType = {
    trackPageView: analytics.trackPageView,
    trackButtonClick: analytics.trackButtonClick,
    trackProjectView: analytics.trackProjectView,
    trackContactFormSubmission: analytics.trackContactFormSubmission,
    trackSkillHover: analytics.trackSkillHover,
    trackScrollDepth: analytics.trackScrollDepth,
    trackExternalLinkClick: analytics.trackExternalLinkClick,
    isTracking: analytics.isTracking,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};
