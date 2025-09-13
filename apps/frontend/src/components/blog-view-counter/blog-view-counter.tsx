"use client";

import { useState, useEffect } from 'react';
import { useVisitorTracking } from '@/hooks/use-visitor-tracking';

type TProps = {
  blogSlug: string;
  blogTitle: string;
  showDetails?: boolean;
  className?: string;
};

export function BlogViewCounter({ 
  blogSlug, 
  blogTitle, 
  showDetails = false, 
  className = '' 
}: TProps) {
  const [viewCount, setViewCount] = useState({
    totalViews: 0,
    uniqueViewers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { trackBlogView, getBlogViewCount } = useVisitorTracking();

  useEffect(() => {
    async function trackView() {
      try {
        // Check if we've already tracked this view in this session
        const sessionKey = `blog-view-${blogSlug}`;
        const hasTracked = sessionStorage.getItem(sessionKey);
        
        if (!hasTracked) {
          // Track the blog view only if not tracked in this session
          await trackBlogView(blogSlug, blogTitle);
          sessionStorage.setItem(sessionKey, 'true');
        }
        
        // Always get updated view count
        const result = await getBlogViewCount(blogSlug);
        if (result?.success && result.viewCount) {
          setViewCount(result.viewCount);
        }
      } catch (error) {
        console.error('Error tracking blog view:', error);
      } finally {
        setIsLoading(false);
      }
    }

    trackView();
  }, [blogSlug, blogTitle, trackBlogView, getBlogViewCount]);

  if (isLoading) {
    return (
      <div className={`text-stone-400 text-sm ${className}`}>
        Loading views...
      </div>
    );
  }

  return (
    <div className={`text-stone-400 text-sm ${className}`}>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="text-stone-500">👁️</span>
          <span className="font-medium text-stone-300">{viewCount.totalViews}</span>
          <span>total views</span>
        </span>
        
        <span className="flex items-center gap-1">
          <span className="text-stone-500">👥</span>
          <span className="font-medium text-stone-300">{viewCount.uniqueViewers}</span>
          <span>unique readers</span>
        </span>
      </div>

      {showDetails && (
        <div className="mt-2 text-xs text-stone-500">
          <span>Analytics tracking active</span>
        </div>
      )}
    </div>
  );
}

