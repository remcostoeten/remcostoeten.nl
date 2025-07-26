import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  FileText, 
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { useAuthContext } from "@/modules/auth/providers/auth-provider";
import { useAnalyticsMetrics, useRealTimeMetrics } from "@/modules/analytics";

export function DashboardPage() {
  const { user, isLoading: authLoading } = useAuthContext();
  
  // Get analytics data for last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics({
    startDate: thirtyDaysAgo,
    endDate: new Date()
  });
  
  const { data: realTimeMetrics, isLoading: realTimeLoading } = useRealTimeMetrics();
  
  function formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
  
  function getTrendIcon(trend: string) {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  }

  const stats = [
    {
      title: "Total Visitors",
      value: metricsLoading ? "--" : formatNumber(metrics?.uniqueVisitors || 0),
      description: metricsLoading ? "Loading..." : "Last 30 days",
      icon: Users,
      trend: "stable"
    },
    {
      title: "Page Views", 
      value: metricsLoading ? "--" : formatNumber(metrics?.totalPageViews || 0),
      description: metricsLoading ? "Loading..." : "Last 30 days",
      icon: BarChart3,
      trend: "stable"
    },
    {
      title: "Active Users",
      value: realTimeLoading ? "--" : (realTimeMetrics?.activeUsers || 0).toString(),
      description: realTimeLoading ? "Loading..." : "Currently online",
      icon: Activity,
      trend: "stable"
    },
    {
      title: "Projects Views",
      value: metricsLoading ? "--" : formatNumber(metrics?.popularProjects?.reduce((sum, p) => sum + p.views, 0) || 0),
      description: metricsLoading ? "Loading..." : "Total project views",
      icon: FileText, 
      trend: "stable"
    }
  ];

  const recentActivity = realTimeMetrics?.recentEvents?.slice(0, 5).map((event, index) => ({
    action: getEventDescription(event),
    time: getRelativeTime(event.timestamp),
    type: event.eventType
  })) || [];
  
  function getEventDescription(event: any): string {
    switch (event.eventType) {
      case 'page_view':
        return `Page viewed: ${event.page}`;
      case 'button_click':
        return `Button clicked: ${event.data?.buttonText || 'Unknown'}`;
      case 'project_view':
        return `Project viewed: ${event.data?.projectTitle || 'Unknown'}`;
      case 'contact_form_submission':
        return 'Contact form submitted';
      default:
        return `${event.eventType} event`;
    }
  }
  
  function getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user ? `, ${user.email.split('@')[0]}` : ''}. Here's what's happening with your site.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = getTrendIcon(stat.trend);
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendIcon className="h-3 w-3" />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions and updates on your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">{activity.action}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                    <Badge variant="secondary">
                      {activity.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    {realTimeLoading ? "Loading recent activity..." : "No recent activity"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-accent rounded-lg transition-colors">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Create New Project</div>
                  <div className="text-sm text-muted-foreground">Add a new project to your portfolio</div>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-accent rounded-lg transition-colors">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">Check your site's performance</div>
                </div>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-accent rounded-lg transition-colors">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Schedule Post</div>
                  <div className="text-sm text-muted-foreground">Plan content for later</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
