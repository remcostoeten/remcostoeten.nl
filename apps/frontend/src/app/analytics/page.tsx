"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const BlogAnalyticsOverview = dynamic(() => import("@/components/blog/blog-analytics-overview").then(mod => ({ default: mod.BlogAnalyticsOverview })), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-muted rounded-lg" />
});

const RealAnalyticsOverview = dynamic(() => import("@/modules/analytics/components/real-analytics-overview").then(mod => ({ default: mod.RealAnalyticsOverview })), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-muted rounded-lg" />
});

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/posts"
          className="text-accent hover:underline text-sm mb-4 inline-block"
        >
          ← Back to blog
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Real-time insights into your blog performance and reader engagement.
        </p>
      </div>

      <div className="space-y-8">
        <BlogAnalyticsOverview />
        <RealAnalyticsOverview />
      </div>
    </div>
  );
}
