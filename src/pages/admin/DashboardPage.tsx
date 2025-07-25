import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  FileText, 
  Activity,
  Calendar,
  Clock
} from "lucide-react";
import { useAuthContext } from "@/modules/auth/providers/AuthProvider";

export function DashboardPage() {
  const { user } = useAuthContext();

  const stats = [
    {
      title: "Total Visitors",
      value: "12,543",
      description: "+20.1% from last month",
      icon: Users,
      trend: "up"
    },
    {
      title: "Page Views", 
      value: "45,231",
      description: "+12.5% from last month",
      icon: BarChart3,
      trend: "up"
    },
    {
      title: "Active Projects",
      value: "8",
      description: "2 completed this month",
      icon: FileText,
      trend: "stable"
    },
    {
      title: "Uptime",
      value: "99.9%",
      description: "Last 30 days",
      icon: Activity,  
      trend: "up"
    }
  ];

  const recentActivity = [
    {
      action: "New contact form submission",
      time: "2 minutes ago",
      type: "contact"
    },
    {
      action: "Analytics data updated",
      time: "15 minutes ago", 
      type: "analytics"
    },
    {
      action: "Project 'Portfolio V3' published",
      time: "1 hour ago",
      type: "content"
    },
    {
      action: "Admin login",
      time: "2 hours ago",
      type: "auth"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email.split('@')[0]}. Here's what's happening with your site.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
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
                <p className="text-xs text-muted-foreground">
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
              {recentActivity.map((activity, index) => (
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
              ))}
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
