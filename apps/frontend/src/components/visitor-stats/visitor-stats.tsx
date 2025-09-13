"use client";

import { useState, useEffect } from 'react';
import { useVisitorTracking } from '@/hooks/use-visitor-tracking';

type TStats = {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  totalBlogViews: number;
  uniqueBlogViews: number;
  topBlogPosts: Array<{
    slug: string;
    title: string;
    viewCount: number;
    uniqueViewers: number;
  }>;
  recentVisitors: Array<{
    visitorId: string;
    isNewVisitor: boolean;
    totalVisits: number;
    lastVisitAt: string;
  }>;
};

type TProps = {
  className?: string;
};

export function VisitorStats({ className = '' }: TProps) {
  const [stats, setStats] = useState<TStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getVisitorStats } = useVisitorTracking();

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await getVisitorStats();
        if (result?.success && result.stats) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error('Error loading visitor stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [getVisitorStats]);

  if (isLoading) {
    return (
      <div className={`bg-stone-800/30 rounded-lg p-6 border border-stone-700/50 ${className}`}>
        <div className="text-stone-400">Loading visitor statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-stone-800/30 rounded-lg p-6 border border-stone-700/50 ${className}`}>
        <div className="text-stone-400">No statistics available</div>
      </div>
    );
  }

  return (
    <div className={`bg-stone-800/30 rounded-lg p-6 border border-stone-700/50 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-6">Visitor Statistics</h3>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.totalVisitors}</div>
          <div className="text-sm text-stone-400">Total Visitors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.newVisitors}</div>
          <div className="text-sm text-stone-400">New Visitors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.returningVisitors}</div>
          <div className="text-sm text-stone-400">Returning</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.totalBlogViews}</div>
          <div className="text-sm text-stone-400">Total Views</div>
        </div>
      </div>

      {/* Top Blog Posts */}
      {stats.topBlogPosts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-3">Top Blog Posts</h4>
          <div className="space-y-2">
            {stats.topBlogPosts.slice(0, 5).map((post, index) => (
              <div key={post.slug} className="flex items-center justify-between p-3 bg-stone-700/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-stone-500 text-sm font-medium">#{index + 1}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{post.title}</div>
                    <div className="text-stone-400 text-xs">{post.uniqueViewers} unique viewers</div>
                  </div>
                </div>
                <div className="text-orange-400 font-medium">{post.viewCount} views</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Visitors */}
      {stats.recentVisitors.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Recent Visitors</h4>
          <div className="space-y-2">
            {stats.recentVisitors.slice(0, 5).map((visitor, index) => (
              <div key={visitor.visitorId} className="flex items-center justify-between p-3 bg-stone-700/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-stone-500 text-sm font-medium">#{index + 1}</span>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {visitor.visitorId.substring(0, 8)}...
                    </div>
                    <div className="text-stone-400 text-xs">
                      {visitor.totalVisits} visits
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    visitor.isNewVisitor 
                      ? 'bg-green-400/20 text-green-400' 
                      : 'bg-blue-400/20 text-blue-400'
                  }`}>
                    {visitor.isNewVisitor ? 'New' : 'Returning'}
                  </span>
                  <span className="text-stone-400 text-xs">
                    {new Date(visitor.lastVisitAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

