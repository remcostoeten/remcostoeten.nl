import { AnalyticsDashboard } from "@/modules/analytics/components/AnalyticsDashboard";

export function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Monitor your site's performance and visitor behavior.
        </p>
      </div>
      
      <AnalyticsDashboard hideHeader={true} />
    </div>
  );
}
