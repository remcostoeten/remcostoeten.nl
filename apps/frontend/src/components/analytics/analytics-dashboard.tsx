'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/config/api.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Eye, TrendingUp, MapPin, Monitor, Smartphone, Tablet, Globe as Globe2, ExternalLink, Clock, User, Flag } from 'lucide-react';

type TAnalyticsData = {
    visitors: {
        total: number;
        new: number;
        returning: number;
        countries: Array<{ country: string; count: number }>;
        devices: Array<{ device: string; count: number }>;
        browsers: Array<{ browser: string; count: number }>;
        referrers: Array<{ referrer: string; count: number }>;
    };
    pageviews: {
        total: number;
        today: number;
        thisWeek: number;
        topPages: Array<{ url: string; count: number }>;
    };
    blogViews: {
        total: number;
        topPosts: Array<{ slug: string; title: string; views: number }>;
    };
    visitorLogs: Array<{
        id: string;
        timestamp: string;
        country: string;
        city?: string;
        device: string;
        browser: string;
        referrer?: string;
        page: string;
        userAgent: string;
        ipAddress: string;
    }>;
};

export function AnalyticsDashboard() {
    const [data, setData] = useState<TAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                setLoading(true);

                const [visitorsRes, pageviewsRes, blogRes] = await Promise.all([
                    fetch(apiUrl('/api/visitors/stats'), { credentials: 'include' }),
                    fetch(apiUrl('/api/pageviews/stats'), { credentials: 'include' }),
                    fetch(apiUrl('/api/blog/views/stats'), { credentials: 'include' })
                ]);

                if (!visitorsRes.ok || !pageviewsRes.ok || !blogRes.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const [visitors, pageviews, blog] = await Promise.all([
                    visitorsRes.json(),
                    pageviewsRes.json(),
                    blogRes.json()
                ]);

                setData({
                    visitors: visitors.data,
                    pageviews: pageviews.data,
                    blogViews: blog.data,
                    visitorLogs: [] // No visitor logs endpoint available yet
                });
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError(err instanceof Error ? err.message : 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="border-border/50">
                            <CardContent className="p-12">
                                <div className="h-4 bg-muted rounded-md w-3/4 mb-3 animate-pulse"></div>
                                <div className="h-10 bg-muted rounded-md w-2/3 animate-pulse"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                        <TrendingUp className="h-8 w-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Unable to Load Analytics</h3>
                    <p className="text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const calculatePercentage = (value: number, total: number) =>
        total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="space-y-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-16">
                <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                    <CardContent className="p-12">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Total Visitors</p>
                                <p className="text-3xl font-bold tracking-tight">{data.visitors.total.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-accent/10">
                                <Users className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <Badge variant="secondary" className="text-xs font-medium">
                                <span className="w-2 h-2 rounded-full bg-accent mr-1.5"></span>
                                {data.visitors.new} new
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium">
                                <span className="w-2 h-2 rounded-full bg-muted-foreground mr-1.5"></span>
                                {data.visitors.returning} returning
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                    <CardContent className="p-12">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Page Views</p>
                                <p className="text-3xl font-bold tracking-tight">{data.pageviews.total.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-accent/10">
                                <Eye className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <Badge variant="secondary" className="text-xs font-medium">
                                {data.pageviews.today} today
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium">
                                {data.pageviews.thisWeek} this week
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                    <CardContent className="p-12">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Blog Views</p>
                                <p className="text-3xl font-bold tracking-tight">{data.blogViews.total.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-accent/10">
                                <TrendingUp className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="text-xs font-medium">
                                {data.blogViews.topPosts.length} posts tracked
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-shadow">
                    <CardContent className="p-12">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-3">Global Reach</p>
                                <p className="text-3xl font-bold tracking-tight">{data.visitors.countries.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-accent/10">
                                <Globe className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="text-xs font-medium">
                                countries
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <MapPin className="h-4 w-4 text-accent" />
                            </div>
                            Top Countries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.visitors.countries.slice(0, 5).map((country, index) => {
                                const percentage = calculatePercentage(country.count, data.visitors.total);
                                return (
                                    <div key={country.country} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                                                    {index + 1}
                                                </div>
                                                <span className="text-sm font-medium">{country.country}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground">{percentage}%</span>
                                                <Badge variant="secondary" className="font-semibold">{country.count}</Badge>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <Monitor className="h-4 w-4 text-accent" />
                            </div>
                            Device Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.visitors.devices.map((device) => {
                                const Icon = device.device === 'mobile' ? Smartphone :
                                    device.device === 'tablet' ? Tablet : Monitor;
                                const percentage = calculatePercentage(device.count, data.visitors.total);
                                const colorClass = device.device === 'mobile' ? 'from-blue-500 to-blue-400' :
                                    device.device === 'tablet' ? 'from-emerald-500 to-emerald-400' : 'from-orange-500 to-orange-400';

                                return (
                                    <div key={device.device}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <div className="p-1.5 rounded-md bg-muted">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-medium capitalize">{device.device}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground">{percentage}%</span>
                                                <Badge variant="secondary" className="font-semibold">{device.count}</Badge>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <Globe2 className="h-4 w-4 text-accent" />
                            </div>
                            Top Browsers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.visitors.browsers.slice(0, 5).map((browser, index) => (
                                <div key={browser.browser} className="flex items-center justify-between p-6 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium">{browser.browser}</span>
                                    </div>
                                    <Badge variant="secondary" className="font-semibold">{browser.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <ExternalLink className="h-4 w-4 text-accent" />
                            </div>
                            Traffic Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.visitors.referrers.slice(0, 5).map((referrer, index) => (
                                <div key={referrer.referrer} className="flex items-center justify-between p-6 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium truncate">
                                            {referrer.referrer || 'Direct Traffic'}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="font-semibold ml-2">{referrer.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <Eye className="h-4 w-4 text-accent" />
                            </div>
                            Top Pages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.pageviews.topPages.slice(0, 5).map((page, index) => (
                                <div key={page.url} className="flex items-center justify-between p-6 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium truncate font-mono">{page.url}</span>
                                    </div>
                                    <Badge variant="secondary" className="font-semibold ml-2">{page.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-accent/10">
                                <TrendingUp className="h-4 w-4 text-accent" />
                            </div>
                            Top Blog Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.blogViews.topPosts.slice(0, 5).map((post, index) => (
                                <div key={post.slug} className="flex items-center justify-between p-6 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium truncate">{post.title}</span>
                                    </div>
                                    <Badge variant="secondary" className="font-semibold ml-2">{post.views}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visitor Logs */}
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                        <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold">Visitor Logs</h2>
                </div>

                <Card className="border-border/50">
                    <CardContent className="p-8">
                        {data.visitorLogs.length === 0 ? (
                            <div className="text-center py-12">
                                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No visitor logs available yet</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.visitorLogs.slice(0, 20).map((log, index) => (
                                    <div key={log.id} className="flex items-center justify-between p-6 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Flag className="h-4 w-4 text-accent" />
                                                        <span className="text-sm font-medium">{log.country}</span>
                                                        {log.city && (
                                                            <span className="text-sm text-muted-foreground">, {log.city}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Monitor className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">{log.device}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Globe2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">{log.browser}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="truncate max-w-[300px] font-mono">{log.page}</span>
                                                    {log.referrer && (
                                                        <span className="truncate max-w-[200px]">
                                                            from {log.referrer}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {log.ipAddress}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {data.visitorLogs.length > 20 && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-muted-foreground">
                                            Showing 20 of {data.visitorLogs.length} visitor logs
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
