import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { BlogAnalyticsOverview } from "@/components/blog/blog-analytics-overview";
import { RealAnalyticsOverview } from "@/modules/analytics/components/real-analytics-overview";

export default async function AnalyticsPage() {
  return (
    <PageLayout>
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
    </PageLayout>
  );
}