# Analytics Testing Implementation

This document describes the comprehensive testing implementation for the analytics flow in the application.

## Overview

The analytics testing implementation includes:

1. **Unit Tests** - Test analytics factory functions with mock database
2. **Integration Tests** - Test the full analytics component flow in the app
3. **Manual Verification** - Script for testing the complete analytics flow with database

## Test Structure

```
src/test/
├── setup.ts                      # Test environment setup
├── db-utils.ts                   # Database utilities for testing
├── analytics-simple.test.ts      # Unit tests for analytics functions
├── analytics-integration.test.tsx # Integration tests for analytics components
└── analytics-factory-testable.ts # Testable version of analytics factory
```

## Running Tests

### Unit Tests
```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test src/test/analytics-simple.test.ts

# Run tests in watch mode
pnpm test --watch

# Run tests with UI
pnpm test:ui
```

### Integration Tests
```bash
# Run integration tests
pnpm test src/test/analytics-integration.test.tsx
```

### Manual Verification
```bash
# Run comprehensive analytics flow test
pnpm test:analytics
```

## Test Coverage

### Unit Tests (`analytics-simple.test.ts`)

Tests all analytics factory functions:

- ✅ `recordPageView()` - Records page view events
- ✅ `getPageViews()` - Retrieves page view events with filtering
- ✅ `getAnalyticsMetrics()` - Calculates analytics metrics by timeframe
- ✅ `getTopPages()` - Gets most visited pages
- ✅ `getAnalyticsEvents()` - Retrieves all analytics events

**Features tested:**
- Database insertion and retrieval
- Parameter validation
- Error handling
- Data transformations
- Query filtering and limits

### Integration Tests (`analytics-integration.test.tsx`)

Tests the complete analytics flow in the application:

- ✅ Page view tracking on component mount
- ✅ API call verification with correct payload
- ✅ Error handling for failed API requests
- ✅ Duplicate tracking prevention for same path

**Features tested:**
- SolidJS component rendering
- Router integration
- HTTP request mocking
- Real-world user interaction simulation

### Manual Verification Script (`scripts/test-analytics.js`)

Comprehensive end-to-end testing:

- 🚀 Starts development server
- 📊 Makes real API calls to analytics endpoints
- 📋 Verifies database storage
- 📈 Tests all API endpoints
- 🏆 Provides manual verification instructions

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup (`src/test/setup.ts`)

- Configures JSDOM environment
- Sets up global DOM APIs
- Mocks fetch function
- Initializes testing-library/jest-dom

## Analytics Factory Testing

### Mock Database Implementation

The tests use a mock database implementation that simulates the Drizzle ORM interface:

```typescript
const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => [mockEvent])
    }))
  })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => [])
        }))
      }))
    }))
  }))
}
```

### Test Data

Example test events used across tests:

```typescript
const testEvent = {
  page: '/home',
  userId: 'test-user-1',
  sessionId: 'session-1',
  userAgent: 'Test Browser 1.0',
  referrer: 'https://google.com',
  country: 'US'
}
```

## Integration Testing

### Component Testing

Tests the `AnalyticsTracker` component within a Router context:

```typescript
function TestApp() {
  return (
    <Router>
      <Route path="/" component={TestPage} />
    </Router>
  )
}
```

### Mock Environment

- Mocks `fetch` globally
- Mocks `navigator.userAgent`
- Mocks `document.referrer`
- Provides realistic browser environment

## Manual Verification

### Steps for Manual Testing

1. **Run the verification script:**
   ```bash
   pnpm test:analytics
   ```

2. **Open browser to http://localhost:3000**

3. **Navigate between pages to generate analytics events**

4. **Check database with Drizzle Studio:**
   ```bash
   pnpm db:studio
   ```

5. **Verify events in `analytics_events` table**

### Expected Results

The script will:
- ✅ Record test page views via API
- ✅ Retrieve and display stored events
- ✅ Show analytics metrics (views, visitors, pages)
- ✅ Display top pages by views
- 📊 Provide database verification instructions

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check database configuration in `.env`
   - Run `pnpm db:push` to sync schema

2. **Test Failures**
   - Check that all dependencies are installed
   - Verify Vitest configuration
   - Ensure mock implementations match actual APIs

3. **Integration Test Issues**
   - Verify SolidJS router setup
   - Check component imports
   - Ensure DOM environment is properly configured

### Debug Tips

- Use `pnpm test --reporter=verbose` for detailed output
- Add `console.log` statements in test files for debugging
- Use `pnpm test:ui` for interactive debugging
- Check browser network tab during manual verification

## Future Enhancements

- [ ] Add performance testing for high-volume analytics
- [ ] Implement snapshot testing for API responses
- [ ] Add browser automation tests (Playwright/Cypress)
- [ ] Create load testing for analytics endpoints
- [ ] Add visual regression testing for analytics dashboard

## Related Files

- `src/db/factories/analytics-factory.ts` - Main analytics factory
- `src/components/analytics/AnalyticsTracker.tsx` - Analytics tracking component
- `src/hooks/use-track-page-view.ts` - Page view tracking hook
- `src/routes/api/analytics/` - Analytics API endpoints
- `src/lib/validation/analytics.ts` - Input validation schemas
