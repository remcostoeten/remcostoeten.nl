'use client';

import { motion } from "framer-motion";
import { Eye, Users, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { useRealAnalytics } from "@/hooks/use-real-analytics";
import { Button } from "@/components/ui/button";

export const RealAnalyticsOverview = () => {
  const { stats, loading, error, refreshStats } = useRealAnalytics();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-destructive font-semibold">Error Loading Analytics</h3>
            <p className="text-destructive/80 text-sm mt-1">{error}</p>
          </div>
          <Button onClick={refreshStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">No analytics data available</p>
        <Button onClick={refreshStats} variant="outline" size="sm" className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Load Data
        </Button>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Pageviews",
      value: stats.pageviews.total.toLocaleString(),
      icon: Eye,
      change: stats.pageviews.today > 0 ? `+${stats.pageviews.today} today` : undefined
    },
    {
      label: "Total Visitors", 
      value: stats.visitors.totalVisitors.toLocaleString(),
      icon: Users,
      change: stats.visitors.newVisitors > 0 ? `+${stats.visitors.newVisitors} new` : undefined
    },
    {
      label: "This Week",
      value: stats.pageviews.thisWeek.toLocaleString(), 
      icon: TrendingUp,
      change: stats.pageviews.yesterday > 0 ? `+${stats.pageviews.yesterday} yesterday` : undefined
    },
    {
      label: "Blog Views",
      value: stats.visitors.totalBlogViews.toLocaleString(),
      icon: Calendar,
      change: stats.visitors.uniqueBlogViews > 0 ? `${stats.visitors.uniqueBlogViews} unique` : undefined
    }
  ];

  const additionalStats = [
    {
      label: "Returning Visitors",
      value: `${Math.round((stats.visitors.returningVisitors / stats.visitors.totalVisitors) * 100)}%`
    },
    {
      label: "Unique Pages", 
      value: stats.pageviews.uniqueUrls.toString()
    },
    {
      label: "Top Page",
      value: stats.pageviews.topPages[0]?.url.split('/').pop() || 'N/A'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
          <p className="text-muted-foreground">Real-time website performance metrics</p>
        </div>
        <Button onClick={refreshStats} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="bg-card border border-border rounded-lg p-6"
              {...ANIMATION_CONFIGS.staggered(index * 0.1)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                {metric.change && (
                  <span className="text-xs font-medium text-green-400">
                    {metric.change}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {additionalStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-6"
            {...ANIMATION_CONFIGS.staggered((index + 4) * 0.1)}
          >
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


