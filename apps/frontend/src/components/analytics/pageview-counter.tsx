"use client";

import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { Eye, Users, TrendingUp } from 'lucide-react';

type TProps = {
  blogSlug?: string;
  blogTitle?: string;
  showDetails?: boolean;
  className?: string;
  variant?: 'blog' | 'general';
};

export function PageviewCounter({ 
  blogSlug, 
  blogTitle, 
  showDetails = false, 
  className = '',
  variant = 'blog'
}: TProps) {
  const [viewData, setViewData] = useState({
    totalViews: 0,
    uniqueViewers: 0,
    loading: true,
  });
  
  const { getBlogViewCount, trackBlogView } = useAnalytics();

  useEffect(() => {
    async function loadAndTrackView() {
      if (variant === 'blog' && blogSlug && blogTitle) {
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
            setViewData({
              totalViews: result.viewCount.totalViews || 0,
              uniqueViewers: result.viewCount.uniqueViewers || 0,
              loading: false,
            });
          } else {
            setViewData(prev => ({ ...prev, loading: false }));
          }
        } catch (error) {
          console.error('Error loading blog view count:', error);
          setViewData(prev => ({ ...prev, loading: false }));
        }
      } else {
        // For general pageview counter, we could implement page-specific stats here
        setViewData(prev => ({ ...prev, loading: false }));
      }
    }

    loadAndTrackView();
  }, [blogSlug, blogTitle, variant, trackBlogView, getBlogViewCount]);

  if (viewData.loading) {
    return (
      <div className={`text-stone-400 text-sm animate-pulse ${className}`}>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>Loading views...</span>
        </div>
      </div>
    );
  }

  if (variant === 'blog' && (!blogSlug || viewData.totalViews === 0)) {
    return (
      <div className={`text-stone-400 text-sm ${className}`}>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>No views yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-stone-400 text-sm ${className}`}>
      {showDetails ? (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="font-medium">
              {viewData.totalViews.toLocaleString()} view{viewData.totalViews !== 1 ? 's' : ''}
            </span>
          </div>
          
          {viewData.uniqueViewers > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {viewData.uniqueViewers.toLocaleString()} unique viewer{viewData.uniqueViewers !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {viewData.totalViews > viewData.uniqueViewers && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>
                {(viewData.totalViews / Math.max(viewData.uniqueViewers, 1)).toFixed(1)} avg views per visitor
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>{viewData.totalViews.toLocaleString()} views</span>
          {viewData.uniqueViewers > 0 && viewData.uniqueViewers !== viewData.totalViews && (
            <span className="text-stone-500">• {viewData.uniqueViewers} unique</span>
          )}
        </div>
      )}
    </div>
  );
}
