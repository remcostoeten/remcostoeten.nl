"use client";

import Link from "next/link";
import type { Metadata } from "next";
import { buildSeo } from "@/lib/seo";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Eye, Users, Calendar } from "lucide-react";

// Import analytics components
import { AnalyticsOverview } from "@/modules/analytics/components/analytics-overview";
import { PostPerformanceTable } from "@/modules/analytics/components/PostPerformanceTable";
import { RealAnalyticsOverview } from "@/modules/analytics/components/real-analytics-overview";
import { RealPostPerformanceTable } from "@/modules/analytics/components/real-post-performance-table";
import { RealTimeDashboard } from "@/modules/analytics/components/real-time-dashboard";

// Import blog data and utilities
import { getAllPosts } from "@/lib/blog";
import type { TBlogPost } from "@/lib/blog/types";

export const metadata: Metadata = {
  title: "Analytics | Remco Stoeten",
  description: "Real-time and historical analytics for blog performance, views, and engagement.",
  alternates: {
    canonical: "https://remcostoeten.nl/analytics",
  },
  ...buildSeo({
    title: "Analytics | Remco Stoeten",
    description: "Real-time and historical analytics for blog performance, views, and engagement.",
    url: "https://remcostoeten.nl/analytics",
  }),
};

export default function AnalyticsPage() {
  const [blogPosts, setBlogPosts] = useState<TBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        const posts = await getAllPosts();
        setBlogPosts(posts);
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  // Calculate summary stats for the overview component
  const totalViews = blogPosts.reduce((sum, post) => sum + (post.views?.total || 0), 0);
  const totalUniqueViews = blogPosts.reduce((sum, post) => sum + (post.views?.unique || 0), 0);
  const recentViews = blogPosts.reduce((sum, post) => sum + (post.views?.recent || 0), 0);
  const totalPosts = blogPosts.length;

  // Calculate category stats
  const categoryStats = blogPosts.reduce((acc, post) => {
    const category = post.category || 'uncategorized';
    acc[category] = (acc[category] || 0) + (post.views?.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const categoryStatsArray = Object.entries(categoryStats).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/posts"
            className="text-accent hover:underline text-sm mb-4 inline-block"
          >
            ← Back to blog
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your blog performance and reader engagement.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Blog Performance Overview
              </CardTitle>
              <CardDescription>
                Summary of your blog's key metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsOverview
                totalViews={totalViews}
                totalUniqueViews={totalUniqueViews}
                recentViews={recentViews}
                totalPosts={totalPosts}
                categoryStats={categoryStatsArray}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Individual Post Performance</CardTitle>
              <CardDescription>
                View detailed performance metrics for each blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && (
                <PostPerformanceTable posts={blogPosts} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeDashboard />
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Performance Analytics</CardTitle>
              <CardDescription>
                Real-time performance data for all blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealPostPerformanceTable posts={blogPosts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <RealAnalyticsOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
