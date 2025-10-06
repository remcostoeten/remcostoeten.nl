'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, Users, TrendingUp, MessageCircle } from 'lucide-react';
import { useMultipleViewCounts } from '@/hooks/use-multiple-view-counts';
import { ViewsService } from '@/services/views-service';

interface BlogPost {
    slug: string;
    title: string;
    publishedAt: string;
    category: string;
    tags: string[];
    readTime: number;
}

interface BlogAnalyticsDashboardProps {
    posts: BlogPost[];
}

export function BlogAnalyticsDashboard({ posts }: BlogAnalyticsDashboardProps) {
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const allSlugs = posts.map(post => post.slug);
    const {
        viewCounts,
        loading,
        totalViews,
        totalUniqueViews,
        refreshViewCounts
    } = useMultipleViewCounts(allSlugs, {
        autoRefresh: true,
        refreshInterval: 30000 // Refresh every 30 seconds
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshViewCounts();
        setLastRefresh(new Date());
        setRefreshing(false);
    };

    // Get top performing posts
    const topPosts = posts
        .map(post => ({
            ...post,
            views: viewCounts[post.slug]?.totalViews || 0,
            uniqueViews: viewCounts[post.slug]?.uniqueViews || 0
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    // Calculate category stats
    const categoryStats = posts.reduce((acc, post) => {
        const category = post.category;
        const views = viewCounts[post.slug]?.totalViews || 0;

        if (!acc[category]) {
            acc[category] = { posts: 0, views: 0 };
        }

        acc[category].posts += 1;
        acc[category].views += views;

        return acc;
    }, {} as Record<string, { posts: number; views: number }>);

    const topCategories = Object.entries(categoryStats)
        .sort(([, a], [, b]) => b.views - a.views)
        .slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Blog Analytics</h2>
                    <p className="text-muted-foreground">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    variant="outline"
                    size="sm"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? '...' : totalViews.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all blog posts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Views</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? '...' : totalUniqueViews.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Unique visitors
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{posts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Published articles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? '...' : Math.round(totalViews / Math.max(posts.length, 1)).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per post
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Posts */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Posts</CardTitle>
                    <CardDescription>Posts with the most views</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topPosts.map((post, index) => (
                            <div key={post.slug} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h4 className="font-medium text-foreground line-clamp-1">{post.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {post.category} • {new Date(post.publishedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-foreground">{post.views.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {post.uniqueViews.toLocaleString()} unique
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>Views by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topCategories.map(([category, stats]) => (
                            <div key={category} className="flex items-center justify-between p-3 rounded-lg border">
                                <div>
                                    <h4 className="font-medium text-foreground capitalize">{category}</h4>
                                    <p className="text-sm text-muted-foreground">{stats.posts} posts</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-foreground">{stats.views.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {Math.round(stats.views / stats.posts)} avg per post
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}