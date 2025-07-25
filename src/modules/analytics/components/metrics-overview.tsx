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
          let start = currentValue;
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
      <Card className="w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Error Loading Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
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
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-700',
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
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-700',
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
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-700',
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
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      textColor: 'text-amber-700',
      changeType: avgPageViewsPerVisitor > 2 ? 'positive' : 'neutral',
      trend: avgPageViewsPerVisitor > 2 ? 'Great' : avgPageViewsPerVisitor > 1.5 ? 'Good' : 'Fair'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Analytics Overview
          </h2>
          <p className="text-gray-600 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-blue-500" />
            Key performance metrics for your portfolio
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Real-time data
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => {
          const IconComponent = metric.icon;
          const displayValue = typeof metric.value === 'number' 
            ? (metric.suffix === '%' ? metric.value.toFixed(1) : Math.round(metric.value).toLocaleString())
            : metric.value;
            
          return (
            <Card 
              key={metric.id} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-60`}></div>
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
              
              {/* Floating orb decoration */}
              <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${metric.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 pt-0">
                <div className="space-y-3">
                  <div className={`text-3xl font-bold ${metric.textColor} transition-colors duration-300`}>
                    {displayValue}{metric.suffix || ''}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                      {metric.description}
                    </p>
                    {metric.trend && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-semibold transition-all duration-300 ${
                          metric.changeType === 'positive' 
                            ? 'bg-green-100 text-green-700 border-green-200 group-hover:bg-green-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200 group-hover:bg-blue-200'
                        }`}
                      >
                        {metric.changeType === 'positive' && (
                          <TrendingUpIcon className="w-3 h-3 mr-1" />
                        )}
                        {metric.trend}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 bg-gradient-to-r ${metric.gradient} rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: `${Math.min((metric.rawValue / (Math.max(...metricsData.map(m => m.rawValue)) || 1)) * 100, 100)}%`
                      }}
                    />
                  </div>
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

