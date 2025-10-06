import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { ChartBar as BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Remco Stoeten',
  description: 'Comprehensive analytics dashboard showing visitor insights, page views, and blog performance.',
  robots: 'noindex, nofollow',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/10 border border-border/50">
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Comprehensive insights into your website's performance and visitor behavior.
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  );
}
