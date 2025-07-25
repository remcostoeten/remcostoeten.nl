import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  UsersIcon, 
  EyeIcon, 
  MousePointerClickIcon,
  ClockIcon,
  BarChart3Icon,
  ActivityIcon,
  SparklesIcon
} from 'lucide-react';
import type { AnalyticsMetrics } from '../types';

type TProps = {
  metrics?: AnalyticsMetrics;
  isLoading?: boolean;
  error?: Error | null;
};

function MetricsOverview({ metrics, isLoading, error }: TProps) {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  
  // Animate numbers when metrics change
  useEffect(() => {
    if (metrics) {
      const newValues = {
        pageViews: metrics.totalPageViews,
        uniqueVisitors: metrics.uniqueVisitors,
        engagementRate: ((metrics.totalPageViews + (metrics.contactFormStats?.submissions || 0)) / metrics.totalPageViews) * 100,
        avgPageViews: metrics.uniqueVisitors ? metrics.totalPageViews / metrics.uniqueVisitors : 0
      };
      
      // Animate to new values
      Object.keys(newValues).forEach((key) => {
        const targetValue = newValues[key as keyof typeof newValues];
        const currentValue = animatedValues[key] || 0;
        
        if (currentValue !== targetValue) {
          const start = currentValue;
          const duration = 1500;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (targetValue - start) * easeOut;
            
            setAnimatedValues(prev => ({ ...prev, [key]: current }));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      });
    }
  }, [metrics]);

  if (error) {
    return (
      <Card className="w-full border-destructive/20 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Error Loading Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-6 bg-muted rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
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
      id: 'pageViews',
      title: 'Total Page Views',
      value: animatedValues.pageViews || metrics?.totalPageViews || 0,
      rawValue: metrics?.totalPageViews || 0,
      description: 'Total visits across all pages',
      icon: EyeIcon,
      changeType: 'positive',
      trend: '+12%'
    },
    {
      id: 'uniqueVisitors',
      title: 'Unique Visitors',
      value: animatedValues.uniqueVisitors || metrics?.uniqueVisitors || 0,
      rawValue: metrics?.uniqueVisitors || 0,
      description: 'Individual users tracked',
      icon: UsersIcon,
      changeType: 'positive',
      trend: '+8%'
    },
    {
      id: 'engagementRate',
      title: 'Engagement Rate',
      value: animatedValues.engagementRate || engagementRate || 0,
      rawValue: engagementRate,
      suffix: '%',
      description: 'User interaction level',
      icon: TrendingUpIcon,
      changeType: engagementRate > 100 ? 'positive' : 'neutral',
      trend: engagementRate > 150 ? 'High' : engagementRate > 100 ? 'Good' : 'Fair'
    },
    {
      id: 'avgPageViews',
      title: 'Pages per Visitor',
      value: animatedValues.avgPageViews || avgPageViewsPerVisitor || 0,
      rawValue: avgPageViewsPerVisitor,
      description: 'Average session depth',
      icon: BarChart3Icon,
      changeType: avgPageViewsPerVisitor > 2 ? 'positive' : 'neutral',
      trend: avgPageViewsPerVisitor > 2 ? 'Great' : avgPageViewsPerVisitor > 1.5 ? 'Good' : 'Fair'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Analytics Overview
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-accent" />
            Key performance metrics for your portfolio
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-accent/10 border-accent/20 text-accent">
          <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></div>
          Real-time data
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric) => {
          const IconComponent = metric.icon;
          const displayValue = typeof metric.value === 'number' 
            ? (metric.suffix === '%' ? metric.value.toFixed(1) : Math.round(metric.value).toLocaleString())
            : metric.value;
            
          return (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconComponent className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayValue}{metric.suffix || ''}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                {metric.trend && (
                  <div className="flex items-center mt-2">
                    {metric.changeType === 'positive' && (
                      <TrendingUpIcon className="w-3 h-3 mr-1 text-green-600" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {metric.trend}
                    </span>
                  </div>
                )}
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
              <MousePointerClickIcon className="h-5 w-5 text-primary" />
              Contact Form Performance
            </CardTitle>
            <CardDescription>
              Visitor engagement through your contact form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {metrics.contactFormStats.submissions}
                </div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {metrics.contactFormStats.successRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
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

