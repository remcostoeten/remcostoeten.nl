import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ActivityIcon, UsersIcon, MousePointerClickIcon, RefreshCwIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { RealTimeMetrics } from '../types';

interface RealTimeStatsProps {
  metrics?: RealTimeMetrics;
  loading: boolean;
  onRefresh?: () => void;
}

export const RealTimeStats: React.FC<RealTimeStatsProps> = ({ 
  metrics, 
  loading,
  onRefresh 
}) => {
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view':
        return '👁️';
      case 'button_click':
        return '🖱️';
      case 'project_view':
        return '📂';
      case 'contact_form_submission':
        return '📝';
      case 'scroll_depth':
        return '📏';
      case 'session_start':
        return '🚀';
      case 'external_link_click':
        return '🔗';
      default:
        return '⚡';
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      page_view: 'Page View',
      button_click: 'Button Click',
      project_view: 'Project View',
      contact_form_submission: 'Form Submission',
      scroll_depth: 'Scroll Depth',
      session_start: 'Session Start',
      external_link_click: 'External Link',
    };
    
    return labels[eventType] || eventType;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Real-time overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-card-foreground">Live Data</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Updates every {document.hidden ? '60' : '30'} seconds
          </span>
        </div>
        <div className="flex items-center gap-2">
          {metrics && (
            <span className="text-xs text-muted-foreground">
              Last updated: {format(new Date(), 'HH:mm:ss')}
            </span>
          )}
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="text-xs"
            >
              <RefreshCwIcon className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>
      
      {/* Real-time overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Active Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-muted">
              <UsersIcon className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 text-card-foreground">
              {metrics?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique users (5 min)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Active Sessions
            </CardTitle>
            <div className="p-2 rounded-lg bg-muted">
              <ActivityIcon className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 text-card-foreground">
              {metrics?.activeSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Browser sessions (5 min)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Page Views
            </CardTitle>
            <div className="p-2 rounded-lg bg-muted">
              <ActivityIcon className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 text-card-foreground">
              {metrics?.currentPageViews.reduce((sum, pv) => sum + pv.activeUsers, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active page views
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Recent Events
            </CardTitle>
            <div className="p-2 rounded-lg bg-muted">
              <MousePointerClickIcon className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 text-card-foreground">
              {metrics?.recentEvents.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Events in last 5 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current page views and recent events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Page Views */}
        <Card>
          <CardHeader>
            <CardTitle>Active Pages</CardTitle>
            <CardDescription>
              Pages currently being viewed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics?.currentPageViews || metrics.currentPageViews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No active page views
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.currentPageViews.slice(0, 10).map((pageView, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {pageView.page === '/' ? 'Home' : pageView.page}
                    </span>
                    <Badge variant="secondary">
                      {pageView.activeUsers} user{pageView.activeUsers !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Live Activity</CardTitle>
            <CardDescription>
              Real-time user interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!metrics?.recentEvents || metrics.recentEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent activity
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Type</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.recentEvents.slice(0, 20).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <span className="text-lg" title={getEventTypeLabel(event.eventType)}>
                            {getEventTypeIcon(event.eventType)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {getEventTypeLabel(event.eventType)}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {event.page && `on ${event.page === '/' ? 'Home' : event.page}`}
                              {event.data && typeof event.data === 'object' && (
                                <>
                                  {event.data.buttonText && ` • ${event.data.buttonText}`}
                                  {event.data.projectTitle && ` • ${event.data.projectTitle}`}
                                  {event.data.depth && ` • ${event.data.depth}%`}
                                </>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs text-gray-500">
                            {format(new Date(event.timestamp), 'HH:mm:ss')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
