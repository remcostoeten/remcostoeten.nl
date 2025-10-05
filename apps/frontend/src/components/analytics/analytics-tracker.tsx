'use client';

import { useEffect, useRef } from 'react';
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
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;

    const trackPage = async () => {
      if (trackBlogView) {
        await trackBlog(trackBlogView.blogSlug, trackBlogView.blogTitle);
      } else {
        await autoTrackPageview();
      }
      hasTrackedRef.current = true;
    };

    trackPage();
  }, [trackBlog, trackBlogView, autoTrackPageview]);

  return null;
}


