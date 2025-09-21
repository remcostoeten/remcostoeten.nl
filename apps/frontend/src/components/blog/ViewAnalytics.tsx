'use client';

import { useState, useEffect } from "react";
import { Eye, TrendingUp, BarChart3 } from "lucide-react";

interface ViewAnalyticsProps {
  className?: string;
}

export function ViewAnalytics({ className = "" }: ViewAnalyticsProps) {
  const [allViews, setAllViews] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllViews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog/views/stats');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch analytics');
        }
        
        // Convert the stats format to the expected format
        const stats = result.data;
        const viewsData: Record<string, number> = {};
        
        stats.topPosts.forEach((post: any) => {
          viewsData[post.slug] = post.totalViews;
        });
        
        setAllViews(viewsData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAllViews();
  }, []);

  const totalViews = Object.values(allViews).reduce((sum, views) => sum + views, 0);
  const postCount = Object.keys(allViews).length;
  const averageViews = postCount > 0 ? Math.round(totalViews / postCount) : 0;

  const sortedPosts = Object.entries(allViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 posts

  if (loading) {
    return (
      <div className={`p-4 bg-card border border-border rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-card border border-border rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-card border border-border rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">View Analytics</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{totalViews}</div>
          <div className="text-xs text-muted-foreground">Total Views</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{postCount}</div>
          <div className="text-xs text-muted-foreground">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{averageViews}</div>
          <div className="text-xs text-muted-foreground">Avg Views</div>
        </div>
      </div>

      {sortedPosts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h4 className="font-medium text-foreground">Top Posts</h4>
          </div>
          <div className="space-y-2">
            {sortedPosts.map(([slug, views]) => (
              <div key={slug} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate flex-1 mr-2">{slug}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}