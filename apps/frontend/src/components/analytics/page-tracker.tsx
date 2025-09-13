"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/use-analytics';

type TProps = {
  trackBlog?: {
    slug: string;
    title: string;
  };
  customTitle?: string;
  disabled?: boolean;
};

export function PageTracker({ trackBlog, customTitle, disabled = false }: TProps) {
  const pathname = usePathname();
  const { autoTrackPageview, trackBlogView } = useAnalytics();

  useEffect(() => {
    if (disabled) return;

    async function trackPage() {
      try {
        if (trackBlog) {
          // For blog posts, use the specialized blog tracking
          await trackBlogView(trackBlog.slug, trackBlog.title);
        } else {
          // For general pages, use auto pageview tracking
          await autoTrackPageview();
        }
      } catch (error) {
        console.error('Error tracking page:', error);
      }
    }

    // Track page view after a short delay to ensure the page is fully loaded
    const timer = setTimeout(trackPage, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, trackBlog, customTitle, disabled, autoTrackPageview, trackBlogView]);

  // This component doesn't render anything
  return null;
}
