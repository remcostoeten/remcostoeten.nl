import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { 
  CalendarIcon, 
  BarChart3Icon, 
  TrendingUpIcon, 
  UsersIcon, 
  MousePointerClickIcon,
  EyeIcon,
  ActivityIcon,
  RefreshCwIcon
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '../../../lib/utils';

import { useAnalyticsMetrics, useRealTimeMetrics } from '../hooks/useAnalytics';
import MetricsOverview from './MetricsOverview';
import { PageViewsChart } from './PageViewsChart';
import { TopPagesTable } from './TopPagesTable';
import { DeviceTypesChart } from './DeviceTypesChart';
import { RealTimeStats } from './RealTimeStats';
import { EventsTable } from './EventsTable';
import type { AnalyticsFilters } from '../types';

interface DateRange {
  from: Date;
  to: Date;
}

const predefinedRanges = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1, isYesterday: true },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 7)),
    to: endOfDay(new Date()),
  });
  
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  // Prepare filters
  const filters: AnalyticsFilters = {
    startDate: dateRange.from,
    endDate: dateRange.to,
    ...(selectedPage !== 'all' && { page: selectedPage }),
    ...(selectedEventType !== 'all' && { eventType: selectedEventType }),
  };

  // Fetch data
  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useAnalyticsMetrics(filters);
  
  const { 
    data: realTimeMetrics, 
    isLoading: realTimeLoading,
    refetch: refetchRealTime 
  } = useRealTimeMetrics();

  const handleDateRangeSelect = (range: typeof predefinedRanges[0]) => {
    if (range.isYesterday) {
      const yesterday = subDays(new Date(), 1);
      setDateRange({
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      });
    } else if (range.days === 0) {
      const today = new Date();
      setDateRange({
        from: startOfDay(today),
        to: endOfDay(today),
      });
    } else {
      setDateRange({
        from: startOfDay(subDays(new Date(), range.days)),
        to: endOfDay(new Date()),
      });
    }
  };

  const handleCustomDateChange = (field: 'from' | 'to', date: Date | undefined) => {
    if (!date) return;
    
    setDateRange(prev => ({
      ...prev,
      [field]: field === 'from' ? startOfDay(date) : endOfDay(date),
    }));
  };

  const refreshAllData = () => {
    refetchMetrics();
    refetchRealTime();
  };

  if (metricsError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error Loading Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Failed to load analytics data. Please try again.
              </p>
              <Button onClick={refreshAllData} variant="outline">
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Track your portfolio's performance and user engagement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={refreshAllData} variant="outline" size="sm">
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangeSelect(range)}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(dateRange.from, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => handleCustomDateChange('from', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => handleCustomDateChange('to', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Page Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Page</label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="/">Home</SelectItem>
                  <SelectItem value="/projects">Projects</SelectItem>
                  <SelectItem value="/contact">Contact</SelectItem>
                  <SelectItem value="/about">About</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="page_view">Page Views</SelectItem>
                  <SelectItem value="button_click">Button Clicks</SelectItem>
                  <SelectItem value="project_view">Project Views</SelectItem>
                  <SelectItem value="contact_form_submission">Form Submissions</SelectItem>
                  <SelectItem value="scroll_depth">Scroll Depth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3Icon className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <MousePointerClickIcon className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricsOverview 
            metrics={metrics} 
            loading={metricsLoading} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PageViewsChart 
              data={metrics?.dailyActivity || []} 
              loading={metricsLoading} 
            />
            <DeviceTypesChart 
              data={metrics?.deviceTypes || []} 
              loading={metricsLoading} 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPagesTable 
              data={metrics?.topPages || []} 
              loading={metricsLoading} 
            />
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>
                  Where your visitors are coming from
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics?.topReferrers.slice(0, 5).map((referrer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {referrer.referrer === 'Direct' ? 'Direct Traffic' : referrer.referrer}
                        </span>
                        <Badge variant="secondary">{referrer.visits}</Badge>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">No referrer data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeStats 
            metrics={realTimeMetrics} 
            loading={realTimeLoading} 
          />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <EventsTable filters={filters} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Projects</CardTitle>
                <CardDescription>
                  Most viewed projects by visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics?.popularProjects.slice(0, 5).map((project, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {project.projectTitle}
                        </span>
                        <Badge variant="secondary">{project.views} views</Badge>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">No project data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Form Performance</CardTitle>
                <CardDescription>
                  Form submission statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Submissions</span>
                      <Badge variant="secondary">
                        {metrics?.contactFormStats.submissions || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <Badge 
                        variant={
                          (metrics?.contactFormStats.successRate || 0) > 80 
                            ? "default" 
                            : "destructive"
                        }
                      >
                        {(metrics?.contactFormStats.successRate || 0).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
