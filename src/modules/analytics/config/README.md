# Analytics Path Exclusion

This configuration allows you to exclude specific paths from analytics tracking to prevent infinite loops and unwanted data collection.

## Current Exclusions

The following paths are currently excluded from analytics tracking:

- `/analytics` - The analytics dashboard and all sub-routes

## How It Works

1. **Page View Tracking**: When users navigate to excluded paths, no page view events are tracked
2. **Button Clicks**: Button clicks on excluded pages are ignored
3. **Scroll Tracking**: Scroll depth tracking is disabled on excluded pages
4. **Other Events**: All other analytics events are prevented when on excluded paths

## Adding New Exclusions

To add new paths to be excluded from tracking:

1. Open `src/modules/analytics/config/excluded-paths.ts`
2. Add the new path to the `EXCLUDED_ANALYTICS_PATHS` array
3. Use path prefixes for wildcard matching (e.g., `/admin` will exclude `/admin/users`, `/admin/settings`, etc.)

Example:
```typescript
export const EXCLUDED_ANALYTICS_PATHS = [
  '/analytics',
  '/admin',
  '/debug'
] as const;
```

## Path Matching

The exclusion uses `path.startsWith()` matching, so:

- `/analytics` excludes `/analytics`, `/analytics/dashboard`, `/analytics/events`, etc.
- `/admin` excludes `/admin`, `/admin/users`, `/admin/settings`, etc.

## Usage in Code

You can also use the exclusion function directly in your components:

```typescript
import { shouldExcludeFromTracking } from '@/modules/analytics';

// Check if current path should be excluded
if (!shouldExcludeFromTracking(window.location.pathname)) {
  // Safe to track analytics
  track('custom_event', { data: 'value' });
}
```
