// Components
export { AnalyticsDashboard } from './components/analytics-dashboard';
export { MetricsOverview } from './components/metrics-overview';
export { PageViewsChart } from './components/page-views-chart';
export { DeviceTypesChart } from './components/device-types-chart';
export { TopPagesTable } from './components/top-pages-table';
export { RealTimeStats } from './components/real-time-stats';
export { EventsTable } from './components/events-table';

// Hooks
export { 
  useAnalytics,
  useAnalyticsMetrics,
  useRealTimeMetrics,
  useAnalyticsEvents,
  usePageViewTracking,
  usePageCompletionTracking
} from './hooks/useAnalytics';
export { useTrack } from './hooks/useTrack';

// Providers
export { AnalyticsProvider, useAnalyticsContext } from './providers/analytics-provider';

// Services
export { AnalyticsService } from './services/analyticsService';

// Configuration
export { EXCLUDED_ANALYTICS_PATHS, shouldExcludeFromTracking } from './config/excluded-paths';

// Types
export type {
  TAnalyticsEvent,
  TPageView,
  TButtonClick,
  TProjectView,
  TContactFormSubmission,
  TPageCompleted,
  TSessionStart,
  TExternalLinkClick,
  TAnalyticsEventType,
  TAnalyticsMetrics,
  TAnalyticsFilters,
  TRealTimeMetrics
} from './types';
