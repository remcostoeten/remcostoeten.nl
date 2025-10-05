import type { Metadata } from "next";
import { buildSeo } from "@/lib/seo";
import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = {
  title: "Analytics | Remco Stoeten",
  description: "Real-time and historical analytics for blog performance, views, and engagement.",
  alternates: {
    canonical: "https://remcostoeten.nl/analytics",
  },
  ...buildSeo({
    title: "Analytics | Remco Stoeten",
    description: "Real-time and historical analytics for blog performance, views, and engagement.",
    url: "https://remcostoeten.nl/analytics",
  }),
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
