'use client';

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { useRealAnalytics } from "@/hooks/use-real-analytics";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TBlogPost } from "@/lib/blog/types";

interface RealPostPerformanceTableProps {
  posts: TBlogPost[];
}

export const RealPostPerformanceTable = ({ posts }: RealPostPerformanceTableProps) => {
  const { stats, blogStats, loading, error, refreshStats, fetchBlogStats } = useRealAnalytics();

  // Fetch blog stats when component mounts
  React.useEffect(() => {
    if (stats && posts.length > 0) {
      const blogSlugs = posts.map(post => post.slug);
      fetchBlogStats(blogSlugs);
    }
  }, [stats, fetchBlogStats, posts]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Post Performance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Loading performance metrics...
          </p>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Post Performance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Error loading performance data
          </p>
        </div>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-destructive font-semibold">Error Loading Data</h4>
                <p className="text-destructive/80 text-sm mt-1">{error}</p>
              </div>
              <Button onClick={refreshStats} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Post Performance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No performance data available
          </p>
        </div>
        <div className="p-6">
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <p className="text-muted-foreground mb-4">No analytics data available</p>
            <Button onClick={refreshStats} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Combine blog posts with real analytics data
  const postsWithRealData = posts.map(post => {
    const realStats = blogStats[post.slug] || { totalViews: 0, uniqueViewers: 0, newVisitorViews: 0, returningVisitorViews: 0 };
    const topBlogPost = stats.visitors.topBlogPosts.find(top => top.slug === post.slug);
    
    return {
      ...post,
      realViews: {
        total: realStats.totalViews || topBlogPost?.viewCount || 0,
        unique: realStats.uniqueViewers || topBlogPost?.uniqueViewers || 0,
        new: realStats.newVisitorViews || 0,
        returning: realStats.returningVisitorViews || 0,
      }
    };
  });

  const sortedPosts = [...postsWithRealData].sort((a, b) => b.realViews.total - a.realViews.total);

  return (
    <motion.div
      className="bg-card border border-border rounded-lg overflow-hidden"
      {...ANIMATION_CONFIGS.staggered(0.3)}
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Post Performance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time performance metrics for all blog posts
            </p>
          </div>
          <Button onClick={refreshStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-96">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-muted-foreground border-b border-border bg-secondary/20">
            <div className="col-span-5">Post Title</div>
            <div className="col-span-2 text-center">Total Views</div>
            <div className="col-span-2 text-center">Unique Views</div>
            <div className="col-span-2 text-center">New Visitors</div>
            <div className="col-span-1 text-center">Category</div>
          </div>
          
          <div className="divide-y divide-border">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-secondary/10 transition-colors items-center"
                {...ANIMATION_CONFIGS.staggered(0.05 * index)}
              >
                <div className="col-span-5">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-foreground hover:text-accent font-medium text-sm line-clamp-2"
                  >
                    {post.title}
                  </Link>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-foreground font-semibold">
                    {post.realViews.total.toLocaleString()}
                  </span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-muted-foreground">
                    {post.realViews.unique.toLocaleString()}
                  </span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-muted-foreground">
                    {post.realViews.new.toLocaleString()}
                  </span>
                </div>
                
                <div className="col-span-1 text-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-accent/20 border border-accent/40" 
                        title={post.category.replace('-', ' ')}>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
