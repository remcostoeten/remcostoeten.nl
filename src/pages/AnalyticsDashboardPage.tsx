import React from 'react';
import { AnalyticsDashboard, AnalyticsProvider } from '../modules/analytics';

export default function AnalyticsDashboardPage() {
  return (
    <AnalyticsProvider enableAutoTracking={false}>
      <div className="min-h-screen">
        <AnalyticsDashboard />
      </div>
    </AnalyticsProvider>
  );
}
