# Analytics System Documentation

## Overview

This project includes a comprehensive, self-hosted analytics system that tracks user interactions without relying on third-party services like Google Analytics. All data is stored locally in your PostgreSQL database.

## Features

### ✨ **Event Tracking**
- **Page Views**: Automatic tracking of page visits
- **Button Clicks**: Track all button interactions
- **Project Views**: Monitor project card interactions
- **Contact Form Submissions**: Track form success/failure rates
- **Scroll Depth**: Monitor how deep users scroll on pages
- **External Link Clicks**: Track outbound link clicks
- **Session Management**: Track user sessions and timezone info

### 📊 **Dashboard Features**
- **Real-time Metrics**: Live user activity in the last 5 minutes
- **Historical Analytics**: Page views, unique visitors, and trends over time
- **Device Type Analytics**: Desktop, mobile, and tablet usage breakdown
- **Top Pages**: Most visited pages with view counts
- **Top Referrers**: Traffic sources and referral data
- **Project Insights**: Most viewed projects
- **Contact Form Performance**: Submission rates and success metrics
- **Interactive Charts**: Visual representation of analytics data

### 🔄 **Real-time Updates**
- Live activity feed showing recent user interactions
- Auto-refreshing real-time metrics every 30 seconds
- Active user count and current page views

## Getting Started

### 1. Database Setup
The analytics system uses your existing PostgreSQL database. The `analytics_events` table is already defined in your schema.

```bash
# Make sure your database is running
npm run db:up

# Push the schema changes
npm run db:push
```

### 2. Access the Dashboard
Navigate to `/analytics-dashboard` in your browser to view the analytics dashboard.

### 3. Automatic Tracking
The `AnalyticsProvider` is already integrated into your app and will automatically track:
- Page views on navigation
- Button clicks throughout the app
- Scroll depth at 25%, 50%, 75%, 90%, and 100%
- External link clicks
- Project interactions
- Contact form submissions

## Manual Event Tracking

You can manually track custom events using the analytics context:

```tsx
import { useAnalyticsContext } from '@/modules/analytics';

function MyComponent() {
  const { trackButtonClick, trackProjectView } = useAnalyticsContext();

  const handleCustomAction = () => {
    trackButtonClick('Custom Action', 'custom-btn', 'my-section');
  };

  return (
    <div data-section=\"my-section\">
      <button onClick={handleCustomAction}>
        Custom Action
      </button>
    </div>
  );
}
```

## Event Types

### Page View
```typescript
{
  eventType: 'page_view',
  page: '/projects',
  referrer: 'https://example.com'
}
```

### Button Click
```typescript
{
  eventType: 'button_click',
  page: '/contact',
  data: {
    buttonText: 'Send Message',
    buttonId: 'submit-btn',
    section: 'contact-form'
  }
}
```

### Project View
```typescript
{
  eventType: 'project_view',
  page: '/',
  data: {
    projectId: 'my-project',
    projectTitle: 'My Awesome Project'
  }
}
```

### Contact Form Submission
```typescript
{
  eventType: 'contact_form_submission',
  page: '/contact',
  data: {
    success: true,
    errors: [] // Only present if success is false
  }
}
```

### Scroll Depth
```typescript
{
  eventType: 'scroll_depth',
  page: '/',
  data: {
    depth: 75, // percentage
    section: 'projects'
  }
}
```

### External Link Click
```typescript
{
  eventType: 'external_link_click',
  page: '/',
  data: {
    url: 'https://github.com/username/repo',
    linkText: 'View on GitHub',
    section: 'projects'
  }
}
```

### Session Start
```typescript
{
  eventType: 'session_start',
  page: '/',
  data: {
    timezone: 'America/New_York',
    screenWidth: 1920,
    screenHeight: 1080,
    userAgent: 'Mozilla/5.0...'
  }
}
```

## Analytics Dashboard Features

### Overview Tab
- **Metrics Cards**: Total page views, unique visitors, session duration, and activity
- **Daily Activity Chart**: Page views and unique visitors over time
- **Device Types Chart**: Pie chart showing device distribution
- **Top Pages Table**: Most visited pages with view counts and percentages
- **Top Referrers**: Traffic sources ranked by visits

### Real-time Tab
- **Active Users**: Users active in the last 5 minutes
- **Current Page Views**: Pages being viewed right now
- **Live Activity Feed**: Real-time stream of user interactions

### Events Tab
- **Event History**: Paginated table of all analytics events
- **Event Filtering**: Filter by date range, page, or event type
- **Event Details**: Full event data including session info and timestamps

### Insights Tab
- **Popular Projects**: Most viewed projects by users
- **Contact Form Performance**: Submission statistics and success rates

## Filtering and Date Ranges

The dashboard supports various filtering options:

- **Predefined Ranges**: Today, Yesterday, Last 7 days, Last 30 days, Last 90 days
- **Custom Date Range**: Pick specific start and end dates
- **Page Filtering**: Filter events by specific pages
- **Event Type Filtering**: Focus on specific types of interactions

## Privacy and Data Handling

### Data Collection
- **No Personal Data**: We don't collect names, emails, or personal information
- **IP Addresses**: Collected but can be disabled for privacy
- **User Agents**: Used for device type categorization
- **Session IDs**: Random UUIDs for session tracking, cleared on browser close
- **No Cookies**: The system works without tracking cookies

### Data Retention
- All analytics data is stored in your own database
- You have full control over data retention policies
- No data is sent to third-party services

## Performance Considerations

### Efficient Database Queries
- Indexed columns for fast querying
- Pagination for large datasets
- Optimized aggregation queries

### Client-side Performance
- Events are tracked asynchronously
- Failed tracking doesn't affect user experience
- Minimal bundle size impact

### Server Resources
- Real-time metrics update every 30 seconds
- Automatic batching of database operations
- Efficient memory usage with proper cleanup

## Customization

### Adding New Event Types
1. Define the event type in `src/modules/analytics/types/index.ts`
2. Add tracking method to the analytics service
3. Update the dashboard components to display the new data

### Custom Metrics
You can add custom metrics by extending the `AnalyticsMetrics` interface and updating the service methods.

### Dashboard Customization
All dashboard components are modular and can be customized or replaced:
- `MetricsOverview`: Summary cards
- `PageViewsChart`: Time series chart
- `DeviceTypesChart`: Pie chart
- `TopPagesTable`: Data table
- `RealTimeStats`: Live activity
- `EventsTable`: Event history

## API Integration

### Service Methods
```typescript
// Track an event
await AnalyticsService.trackEvent({
  eventType: 'custom_event',
  page: '/custom',
  data: { customField: 'value' }
});

// Get metrics with filters
const metrics = await AnalyticsService.getMetrics({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  page: '/projects'
});

// Get real-time data
const realTime = await AnalyticsService.getRealTimeMetrics();

// Get paginated events
const events = await AnalyticsService.getEvents(1, 50, filters);
```

### React Query Integration
The system uses React Query for efficient data fetching and caching:
```typescript
const { data: metrics, isLoading } = useAnalyticsMetrics(filters);
const { data: realTime } = useRealTimeMetrics(); // Auto-refreshes every 30s
const { data: events } = useAnalyticsEvents(page, limit, filters);
```

## Troubleshooting

### Database Connection Issues
Ensure your PostgreSQL database is running and accessible:
```bash
npm run db:up
npm run db:logs
```

### Missing Events
Check the browser console for tracking errors. Events are tracked asynchronously and failures are logged but don't affect the user experience.

### Performance Issues
For high-traffic sites, consider:
- Adding database indexes on frequently queried columns
- Implementing data archiving for old events
- Using database connection pooling

### Dashboard Not Loading
1. Verify the database connection
2. Check that the `analytics_events` table exists
3. Ensure React Query is properly configured

## Advanced Usage

### Custom Analytics Hook
```typescript
import { useAnalytics } from '@/modules/analytics';

function useCustomTracking() {
  const { trackButtonClick } = useAnalytics();
  
  const trackFeatureUsage = (feature: string) => {
    trackButtonClick(`Feature: ${feature}`, undefined, 'features');
  };
  
  return { trackFeatureUsage };
}
```

### Conditional Tracking
```typescript
<AnalyticsProvider enableAutoTracking={process.env.NODE_ENV === 'production'}>
  <App />
</AnalyticsProvider>
```

### Event Data Enrichment
```typescript
const enrichedEvent = {
  ...baseEvent,
  data: {
    ...baseEvent.data,
    userId: user?.id,
    experimentGroup: 'control'
  }
};
```

## Support

For issues or feature requests related to the analytics system:
1. Check the browser console for any errors
2. Verify database connectivity and schema
3. Review the documentation for proper usage
4. Submit an issue with detailed reproduction steps

The analytics system is designed to be lightweight, privacy-focused, and fully under your control while providing comprehensive insights into user behavior.
