// Components
export { AnalyticsDashboard } from './components/AnalyticsDashboard';
export { MetricsOverview } from './components/MetricsOverview';
export { PageViewsChart } from './components/PageViewsChart';
export { DeviceTypesChart } from './components/DeviceTypesChart';
export { TopPagesTable } from './components/TopPagesTable';
export { RealTimeStats } from './components/RealTimeStats';
export { EventsTable } from './components/EventsTable';

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
export { AnalyticsProvider, useAnalyticsContext } from './providers/AnalyticsProvider';

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
