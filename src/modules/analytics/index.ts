// Components
export { AnalyticsDashboard } from './components/AnalyticsDashboard';
export { MetricsOverview } from './components/MetricsOverview';
export { PageViewsChart } from './components/PageViewsChart';
export { DeviceTypesChart } from './components/DeviceTypesChart';
export { TopPagesTable } from './components/TopPagesTable';
export { RealTimeStats } from './components/RealTimeStats';
export { EventsTable } from './components/EventsTable';
export { LoginForm } from './components/LoginForm';

// Hooks
export { 
  useAnalytics,
  useAnalyticsMetrics,
  useRealTimeMetrics,
  useAnalyticsEvents,
  usePageViewTracking,
  useScrollDepthTracking
} from './hooks/useAnalytics';
export { useTrack } from './hooks/useTrack';
export { useAuth } from './hooks/useAuth';

// Providers
export { AnalyticsProvider, useAnalyticsContext } from './providers/AnalyticsProvider';

// Services
export { AnalyticsService } from './services/analyticsService';

// Configuration
export { EXCLUDED_ANALYTICS_PATHS, shouldExcludeFromTracking } from './config/excluded-paths';

// Types
export type {
  AnalyticsEvent,
  PageView,
  ButtonClick,
  ProjectView,
  ContactFormSubmission,
  SkillHover,
  ScrollDepth,
  SessionStart,
  ExternalLinkClick,
  AnalyticsEventType,
  AnalyticsMetrics,
  AnalyticsFilters,
  RealTimeMetrics
} from './types';
