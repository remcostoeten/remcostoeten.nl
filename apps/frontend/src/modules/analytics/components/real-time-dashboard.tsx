'use client';

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Activity, Users, Eye, TrendingUp, Clock, Globe } from "lucide-react";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { useRealAnalytics } from "@/hooks/use-real-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Pause, Play } from "lucide-react";

export const RealTimeDashboard = () => {
  const { stats, loading, error, refreshStats } = useRealAnalytics();
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      refreshStats();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshStats]);

  const toggleAutoRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Real-Time Dashboard</h2>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Real-Time Dashboard</h2>
          <Button onClick={refreshStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-destructive font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-destructive/80 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Real-Time Dashboard</h2>
          <Button onClick={refreshStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Data
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No analytics data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const realTimeMetrics = [
    {
      title: "Active Visitors",
      value: stats.visitors.totalVisitors.toLocaleString(),
      icon: Users,
      change: `+${stats.visitors.newVisitors} new`,
      color: "text-blue-500"
    },
    {
      title: "Page Views Today",
      value: stats.pageviews.today.toLocaleString(),
      icon: Eye,
      change: `+${stats.pageviews.yesterday} vs yesterday`,
      color: "text-green-500"
    },
    {
      title: "Blog Views",
      value: stats.visitors.totalBlogViews.toLocaleString(),
      icon: TrendingUp,
      change: `${stats.visitors.uniqueBlogViews} unique`,
      color: "text-purple-500"
    },
    {
      title: "Pages Tracked",
      value: stats.pageviews.uniqueUrls.toString(),
      icon: Globe,
      change: "All pages",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Real-Time Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleAutoRefresh}
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
          >
            {isAutoRefresh ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
          <Button onClick={refreshStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realTimeMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              {...ANIMATION_CONFIGS.staggered(index * 0.1)}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Top pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pageviews.topPages.slice(0, 5).map((page, index) => (
                <div key={page.url} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground truncate">
                      {page.url.split('/').pop() || page.url}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {page.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.visitors.topBlogPosts.slice(0, 5).map((post, index) => (
                <div key={post.slug} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground truncate">
                      {post.title}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {post.viewCount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


