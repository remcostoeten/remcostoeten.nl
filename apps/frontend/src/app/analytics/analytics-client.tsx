"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp } from "lucide-react";
import { AnalyticsOverview } from "@/modules/analytics/components/analytics-overview";
import { PostPerformanceTable } from "@/modules/analytics/components/post-performance-table";
import { RealAnalyticsOverview } from "@/modules/analytics/components/real-analytics-overview";
import { RealPostPerformanceTable } from "@/modules/analytics/components/real-post-performance-table";
import { RealTimeDashboard } from "@/modules/analytics/components/real-time-dashboard";
import { BlogAnalyticsDashboard } from "@/components/analytics/blog-analytics-dashboard";
import { getAllPosts } from "@/lib/blog/get-posts";
import type { TBlogPost } from "@/lib/blog/types";

interface BlogPostData {
    slug: string;
    title: string;
    publishedAt: string;
    category: string;
    tags: string[];
    readTime: number;
}

export function AnalyticsClient() {
    const [blogPosts, setBlogPosts] = useState<BlogPostData[]>([]);
    const [legacyBlogPosts, setLegacyBlogPosts] = useState<TBlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlogPosts = async () => {
            try {
                // Fetch blog posts from API endpoint
                const response = await fetch('/api/blog/posts');
                const result = await response.json();

                if (result.success) {
                    setBlogPosts(result.data);
                } else {
                    console.error("Failed to load blog posts:", result.error);
                }

                // Also load legacy posts for existing components
                try {
                    const legacyPosts = await getAllPosts();
                    setLegacyBlogPosts(legacyPosts);
                } catch (legacyError) {
                    console.warn("Failed to load legacy posts:", legacyError);
                }
            } catch (error) {
                console.error("Failed to load blog posts:", error);
            } finally {
                setLoading(false);
            }
        };
        loadBlogPosts();
    }, []);

    const totalViews = legacyBlogPosts.reduce((sum, post) => sum + (post.views?.total || 0), 0);
    const totalUniqueViews = legacyBlogPosts.reduce((sum, post) => sum + (post.views?.unique || 0), 0);
    const recentViews = legacyBlogPosts.reduce((sum, post) => sum + (post.views?.recent || 0), 0);
    const totalPosts = legacyBlogPosts.length;

    const categoryStats = legacyBlogPosts.reduce((acc, post) => {
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
                    <Link href="/posts" className="text-accent hover:underline text-sm mb-4 inline-block">← Back to blog</Link>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Comprehensive insights into your blog performance and reader engagement.</p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh All
                </Button>
            </div>

            <Tabs defaultValue="blog" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="blog">Blog Analytics</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="realtime">Real-Time</TabsTrigger>
                    <TabsTrigger value="posts">Post Performance</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="blog" className="space-y-6">
                    {!loading && (
                        <BlogAnalyticsDashboard posts={blogPosts} />
                    )}
                </TabsContent>

                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Blog Performance Overview
                            </CardTitle>
                            <CardDescription>Summary of your blog's key metrics and trends</CardDescription>
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
                            <CardDescription>View detailed performance metrics for each blog post</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!loading && (
                                <PostPerformanceTable posts={legacyBlogPosts} />
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
                            <CardDescription>Real-time performance data for all blog posts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RealPostPerformanceTable posts={legacyBlogPosts} />
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


