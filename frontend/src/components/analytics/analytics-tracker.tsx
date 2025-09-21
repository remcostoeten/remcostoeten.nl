'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

type TAnalyticsTrackerProps = {
  pageTitle?: string;
  trackBlogView?: {
    blogSlug: string;
    blogTitle: string;
  };
};

export function AnalyticsTracker({ pageTitle, trackBlogView }: TAnalyticsTrackerProps) {
  const { autoTrackPageview, trackBlogView: trackBlog } = useAnalytics();

  useEffect(() => {
    const trackPage = async () => {
      if (trackBlogView) {
        await trackBlog(trackBlogView.blogSlug, trackBlogView.blogTitle);
      } else {
        await autoTrackPageview();
      }
    };

    trackPage();
  }, [autoTrackPageview, trackBlog, trackBlogView]);

  return null;
}


