import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BarChart3Icon, UsersIcon, EyeIcon, TrendingUpIcon, SettingsIcon, DatabaseIcon } from "lucide-react";

function AdminDashboard() {
  const location = useLocation();
  
  const stats = [
    {
      title: "Total Visitors",
      value: "--",
      change: "Connect analytics to see data",
      icon: UsersIcon,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Page Views",
      value: "--",
      change: "Connect analytics to see data", 
      icon: EyeIcon,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      title: "Projects",
      value: "--",
      change: "Connect database to see count",
      icon: BarChart3Icon,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    },
    {
      title: "Performance",
      value: "--",
      change: "Monitoring not configured",
      icon: TrendingUpIcon,
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    }
  ];

  const quickActions = [
    { name: "View Analytics", description: "Detailed analytics dashboard", shortcut: "⎵ ⎵ ⎵ 2" },
    { name: "Manage Projects", description: "Add, edit, or remove projects", shortcut: "⎵ ⎵ ⎵ 3" },
    { name: "Site Settings", description: "Configure portfolio settings", shortcut: "⎵ ⎵ ⎵ 4" },
    { name: "Database", description: "Manage content and data", shortcut: "⎵ ⎵ ⎵ 5" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Welcome back! Here's what's happening with your portfolio.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                Live Data
              </Badge>
              <Button variant="outline" size="sm">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div className="flex gap-4">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              ← Back to Portfolio
            </Link>
            <Link 
              to="/admin" 
              className={`transition-colors ${
                location.pathname === '/admin'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/analytics" 
              className={`transition-colors ${
                location.pathname === '/admin/analytics'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Analytics
            </Link>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="hidden sm:inline">Quick nav: </span>
            <kbd className="bg-gradient-to-b from-background to-muted border border-border shadow-sm px-3 py-1.5 rounded-md text-xs font-mono font-medium text-foreground hover:shadow-md transition-shadow">
              ⎵ ⎵ ⎵ 0
            </kbd>
            <span className="hidden sm:inline"> for home</span>
          </div>
        </nav>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="bg-card border-border hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <div key={action.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">{action.name}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <kbd className="bg-gradient-to-b from-primary/10 to-primary/20 border border-primary/30 text-primary shadow-sm px-3 py-1.5 rounded-md text-xs font-mono font-medium hover:shadow-md hover:from-primary/15 hover:to-primary/25 transition-all duration-200">
                    {action.shortcut}
                  </kbd>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Master these shortcuts for faster navigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Go to Home</span>
                  <kbd className="bg-gradient-to-b from-accent/10 to-accent/20 border border-accent/30 text-accent shadow-sm px-2.5 py-1 rounded-md text-xs font-mono font-medium hover:shadow-md transition-all">⎵ ⎵ ⎵ 0</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Dashboard</span>
                  <kbd className="bg-gradient-to-b from-accent/10 to-accent/20 border border-accent/30 text-accent shadow-sm px-2.5 py-1 rounded-md text-xs font-mono font-medium hover:shadow-md transition-all">⎵ ⎵ ⎵ 1</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics</span>
                  <kbd className="bg-gradient-to-b from-accent/10 to-accent/20 border border-accent/30 text-accent shadow-sm px-2.5 py-1 rounded-md text-xs font-mono font-medium hover:shadow-md transition-all">⎵ ⎵ ⎵ 2</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Toggle Admin/Home</span>
                  <kbd className="bg-gradient-to-b from-red-500/10 to-red-500/20 border border-red-500/30 text-red-500 shadow-sm px-2.5 py-1 rounded-md text-xs font-mono font-medium hover:shadow-md transition-all">⎵ ⎵ ⎵ ⌫⌫⌫</kbd>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Start typing any sequence to see the visual indicator
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest changes and updates to your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  No recent activity to display
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Connect your analytics system to see real-time activity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
