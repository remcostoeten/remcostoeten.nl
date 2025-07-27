# Analytics Tracking

Client-side page view tracking for the application.

## Usage

### Using the Hook Directly

```tsx
import { useTrackPageView } from '~/hooks/use-track-page-view'

function MyComponent() {
  // Automatically tracks route changes
  useTrackPageView({
    userId: 'user-123',
    sessionId: 'session-456',
    debounceMs: 300 // Optional, defaults to 300ms
  })

  return <div>My component content</div>
}
```

### Using the Component Helper

```tsx
import { AnalyticsTracker } from '~/components/analytics'

function App() {
  return (
    <>
      <AnalyticsTracker 
        userId="user-123"
        sessionId="session-456"
        debounceMs={500}
      />
      {/* Your app content */}
    </>
  )
}
```

### Manual Tracking

```tsx
import { useTrackPageView } from '~/hooks/use-track-page-view'

function MyComponent() {
  const { trackPageView } = useTrackPageView()

  function handleCustomNavigation() {
    // Manually track a page view
    trackPageView('/custom-path', 'https://referrer.com')
  }

  return (
    <button onClick={handleCustomNavigation}>
      Custom Navigation
    </button>
  )
}
```

## Features

- **Automatic Route Tracking**: Automatically detects route changes using SolidJS Router
- **Debouncing**: Prevents duplicate tracking calls within the specified time window
- **Duplicate Prevention**: Skips tracking if the same path is accessed consecutively
- **Manual Tracking**: Supports manual page view tracking for custom scenarios
- **TypeScript Support**: Fully typed with proper TypeScript definitions
- **Error Handling**: Gracefully handles fetch errors without breaking the app

## API

### `useTrackPageView(options)`

**Options:**
- `debounceMs?: number` - Debounce delay in milliseconds (default: 300)
- `userId?: string` - Optional user ID to associate with page views
- `sessionId?: string` - Optional session ID to associate with page views

**Returns:**
- `trackPageView(pathname: string, referrer?: string)` - Function to manually track page views

### `<AnalyticsTracker />`

**Props:**
- `userId?: string` - Optional user ID
- `sessionId?: string` - Optional session ID  
- `debounceMs?: number` - Debounce delay in milliseconds

This component renders nothing visible and is purely for tracking purposes.
