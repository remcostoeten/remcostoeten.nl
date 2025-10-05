import { motion } from "framer-motion";
import { Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { ANIMATION_CONFIGS } from "@/modules/shared";

interface AnalyticsOverviewProps {
  totalViews: number;
  totalUniqueViews: number;
  recentViews: number;
  totalPosts: number;
  previousTotalViews?: number;
  previousUniqueViews?: number;
  previousRecentViews?: number;
  categoryStats?: Array<{ category: string; count: number }>;
}

export const AnalyticsOverview = ({
  totalViews,
  totalUniqueViews,
  recentViews,
  totalPosts,
  previousTotalViews,
  previousUniqueViews,
  previousRecentViews,
  categoryStats
}: AnalyticsOverviewProps) => {
  // Helper function to calculate percentage change
  const calculateChange = (current: number, previous?: number): string | undefined => {
    if (!previous || previous === 0) return undefined;
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Get most popular category
  const mostPopularCategory = categoryStats?.length ?
    categoryStats.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    ).category : 'General';
  const metrics = [
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      change: calculateChange(totalViews, previousTotalViews)
    },
    {
      label: "Unique Visitors",
      value: totalUniqueViews.toLocaleString(),
      icon: Users,
      change: calculateChange(totalUniqueViews, previousUniqueViews)
    },
    {
      label: "Recent Views (30d)",
      value: recentViews.toLocaleString(),
      icon: TrendingUp,
      change: calculateChange(recentViews, previousRecentViews)
    },
    {
      label: "Total Posts",
      value: totalPosts.toString(),
      icon: Calendar
    }
  ];

  const additionalStats = [
    {
      label: "Avg. Views per Post",
      value: Math.round(totalViews / totalPosts).toLocaleString()
    },
    {
      label: "View Conversion Rate",
      value: `${Math.round((totalUniqueViews / totalViews) * 100)}%`
    },
    {
      label: "Most Popular Category",
      value: mostPopularCategory
    }
  ];

  return (
    <div className="space-y-8">
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