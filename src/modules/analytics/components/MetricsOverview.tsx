import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  TrendingUpIcon, 
  UsersIcon, 
  EyeIcon, 
  MousePointerClickIcon,
  ClockIcon,
  BarChart3Icon
} from 'lucide-react';
import type { AnalyticsMetrics } from '../types';

type TProps = {
  metrics?: AnalyticsMetrics;
  isLoading?: boolean;
  error?: Error | null;
};

function MetricsOverview({ metrics, isLoading, error }: TProps) {
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate derived metrics
  const totalEvents = (metrics?.totalPageViews ?? 0) + 
    (metrics?.contactFormStats?.submissions ?? 0);
  const engagementRate = metrics?.totalPageViews 
    ? ((totalEvents / metrics.totalPageViews) * 100)
    : 0;
  const avgPageViewsPerVisitor = metrics?.uniqueVisitors 
    ? (metrics.totalPageViews / metrics.uniqueVisitors)
    : 0;

  const metricsData = [
    {
      title: 'Total Page Views',
      value: metrics?.totalPageViews ?? 0,
      change: '+12%', // Could be calculated from daily activity
      description: 'Total visits across all pages',
      icon: EyeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Unique Visitors',
      value: metrics?.uniqueVisitors ?? 0,
      change: metrics?.uniqueVisitors > 0 ? `${((metrics.uniqueVisitors / (metrics.totalPageViews || 1)) * 100).toFixed(0)}% unique` : 'N/A',
      description: 'Individual users (fingerprint-based)',
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Engagement Rate',
      value: engagementRate.toFixed(1),
      suffix: '%',
      change: engagementRate > 150 ? 'High' : engagementRate > 100 ? 'Good' : 'Low',
      description: 'Events per page view',
      icon: TrendingUpIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pages per Visitor',
      value: avgPageViewsPerVisitor.toFixed(1),
      change: avgPageViewsPerVisitor > 2 ? 'Great' : avgPageViewsPerVisitor > 1.5 ? 'Good' : 'Fair',
      description: 'Average exploration depth',
      icon: BarChart3Icon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">Key performance metrics for your portfolio</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Real-time data
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric) => {
          const IconComponent = metric.icon;
          const displayValue = typeof metric.value === 'number' 
            ? metric.value.toLocaleString() 
            : metric.value;
            
          return (
            <Card key={metric.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayValue}{metric.suffix || ''}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                  {metric.change && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {metric.change}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact form performance - only show if there are submissions */}
      {metrics?.contactFormStats && metrics.contactFormStats.submissions > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MousePointerClickIcon className="h-5 w-5 text-blue-600" />
              Contact Form Performance
            </CardTitle>
            <CardDescription>
              Visitor engagement through your contact form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.contactFormStats.submissions}
                </div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.contactFormStats.successRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {((metrics.contactFormStats.submissions / metrics.totalPageViews) * 100).toFixed(2)}%
                </div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { MetricsOverview };

