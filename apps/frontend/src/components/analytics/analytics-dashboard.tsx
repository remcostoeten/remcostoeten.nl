"use client";

import { useState, useEffect } from 'react';
import { useAnalytics, type TAnalyticsStats } from '@/hooks/use-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Eye, Globe, Clock, User } from 'lucide-react';

type TProps = {
  className?: string;
  compact?: boolean;
};

export function AnalyticsDashboard({ className = '', compact = false }: TProps) {
  const [stats, setStats] = useState<TAnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAnalyticsStats } = useAnalytics();

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getAnalyticsStats();
        if (result) {
          setStats(result);
        } else {
          setError('Failed to load analytics data');
        }
      } catch (err) {
        console.error('Error loading analytics stats:', err);
        setError('An error occurred while loading analytics');
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [getAnalyticsStats]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-stone-800/30 border-stone-700/50">
              <CardContent className="p-4">
                <div className="h-4 bg-stone-600/30 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-stone-600/30 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className={`bg-stone-800/30 border-stone-700/50 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="text-stone-400">
            {error || 'No analytics data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string;
    value: number | string;
    icon: any;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card className="bg-stone-800/30 border-stone-700/50 hover:bg-stone-800/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {description && (
              <p className="text-xs text-stone-500 mt-1">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <Icon className="h-5 w-5 text-stone-400" />
            {trend && (
              <Badge 
                variant={trend === 'up' ? 'default' : 'secondary'} 
                className="mt-2 text-xs"
              >
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        <StatCard
          title="Total Views"
          value={stats.pageviews.total.toLocaleString()}
          icon={Eye}
          description="All time"
        />
        <StatCard
          title="Today"
          value={stats.pageviews.today.toLocaleString()}
          icon={TrendingUp}
          description="Today's views"
        />
        <StatCard
          title="Visitors"
          value={stats.visitors.totalVisitors.toLocaleString()}
          icon={Users}
          description="Total visitors"
        />
        <StatCard
          title="Pages"
          value={stats.pageviews.uniqueUrls.toLocaleString()}
          icon={Globe}
          description="Unique pages"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-stone-800/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Pageviews"
              value={stats.pageviews.total.toLocaleString()}
              icon={Eye}
              description="All time views"
            />
            <StatCard
              title="Today's Views"
              value={stats.pageviews.today.toLocaleString()}
              icon={TrendingUp}
              description={`Yesterday: ${stats.pageviews.yesterday}`}
            />
            <StatCard
              title="This Week"
              value={stats.pageviews.thisWeek.toLocaleString()}
              icon={Clock}
              description="Past 7 days"
            />
            <StatCard
              title="Unique Pages"
              value={stats.pageviews.uniqueUrls.toLocaleString()}
              icon={Globe}
              description="Different URLs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Visitors"
              value={stats.visitors.totalVisitors.toLocaleString()}
              icon={Users}
              description="Unique visitors"
            />
            <StatCard
              title="New Visitors"
              value={stats.visitors.newVisitors.toLocaleString()}
              icon={User}
              description="First time visitors"
            />
            <StatCard
              title="Returning"
              value={stats.visitors.returningVisitors.toLocaleString()}
              icon={User}
              description="Repeat visitors"
            />
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card className="bg-stone-800/30 border-stone-700/50">
            <CardHeader>
              <CardTitle className="text-white">Top Pages</CardTitle>
              <CardDescription>Most visited pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pageviews.topPages.map((page, index) => (
                  <div 
                    key={page.url} 
                    className="flex justify-between items-center p-3 rounded-lg bg-stone-700/20 hover:bg-stone-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-white font-medium truncate max-w-xs">
                        {page.url.replace(window.location.origin, '') || '/'}
                      </span>
                    </div>
                    <div className="text-stone-400 font-medium">
                      {page.count.toLocaleString()} views
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-stone-800/30 border-stone-700/50">
              <CardHeader>
                <CardTitle className="text-white">Top Blog Posts</CardTitle>
                <CardDescription>Most viewed blog content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.visitors.topBlogPosts.slice(0, 5).map((post, index) => (
                    <div 
                      key={post.slug} 
                      className="flex justify-between items-center p-3 rounded-lg bg-stone-700/20"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <div>
                          <span className="text-white font-medium block truncate max-w-xs">
                            {post.title}
                          </span>
                          <span className="text-stone-500 text-sm">
                            {post.uniqueViewers} unique viewers
                          </span>
                        </div>
                      </div>
                      <div className="text-stone-400 font-medium">
                        {post.viewCount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-800/30 border-stone-700/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription>Latest visitor activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.visitors.recentVisitors.slice(0, 5).map((visitor) => (
                    <div 
                      key={visitor.visitorId} 
                      className="flex justify-between items-center p-3 rounded-lg bg-stone-700/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          visitor.isNewVisitor ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <span className="text-white font-medium text-sm">
                            {visitor.isNewVisitor ? 'New Visitor' : 'Returning'}
                          </span>
                          <span className="text-stone-500 text-xs block">
                            {visitor.totalVisits} visit{visitor.totalVisits !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-stone-400 text-xs">
                        {new Date(visitor.lastVisitAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
