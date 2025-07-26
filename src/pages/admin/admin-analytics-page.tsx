import { Link, useLocation } from "react-router-dom";
import { AnalyticsDashboard } from "@/modules/analytics/components/analytics-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, BarChart3Icon } from "lucide-react";

export function AdminAnalyticsPage() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Monitor your portfolio's performance and visitor behavior in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs bg-green-400/10 text-green-400 border-green-400/20">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                Live Data
              </Badge>
              <Button variant="outline" size="sm" onClick={() => history.back()}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
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
              className={`transition-colors flex items-center gap-2 ${
                location.pathname === '/admin/analytics'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <BarChart3Icon className="w-4 h-4" />
              Analytics
            </Link>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Quick nav: </span>
            <kbd className="bg-background px-2 py-1 rounded text-xs">⎵ ⎵ ⎵ 2</kbd>
            <span className="hidden sm:inline"> for analytics</span>
          </div>
        </nav>
        
        {/* Analytics Dashboard - Temporarily disabled */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center space-y-4">
            <BarChart3Icon className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Analytics are temporarily disabled while we fix API connectivity issues.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The dashboard will be restored once the backend issues are resolved.
              </p>
            </div>
          </div>
          {/* <AnalyticsDashboard hideHeader={true} /> */}
        </div>
      </div>
    </div>
  );
}
