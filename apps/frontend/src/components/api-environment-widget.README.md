# API Environment Widget

A headless, reusable component for switching between API environments in Next.js applications. Only visible in development mode.

## Features

- **Headless Architecture**: Logic separated into `useApiEnvironment` hook
- **Dev-Only**: Automatically hidden in production builds
- **Persistent**: Environment preference saved to localStorage
- **Customizable**: Position and default state configurable
- **Type-Safe**: Full TypeScript support
- **Zero Dependencies**: Uses only React and your existing API config

## Components

### `ApiEnvironmentWidget`

Main widget component with collapsible UI.

```tsx
import { ApiEnvironmentWidget } from '@/components/api-environment-widget';

function Layout() {
  return (
    <>
      {/* Default bottom-right position */}
      <ApiEnvironmentWidget />
      
      {/* Custom position */}
      <ApiEnvironmentWidget position="bottom-left" />
      
      {/* Start collapsed */}
      <ApiEnvironmentWidget defaultCollapsed />
    </>
  );
}
```

**Props:**
- `position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'` - Widget position (default: `'bottom-right'`)
- `defaultCollapsed?: boolean` - Start in collapsed state (default: `false`)

### `ApiEnvironmentIndicator`

Minimal indicator showing current environment.

```tsx
import { ApiEnvironmentIndicator } from '@/components/api-environment-widget';

function Layout() {
  return <ApiEnvironmentIndicator />;
}
```

### `useApiEnvironment` Hook

Headless hook for building custom UI.

```tsx
import { useApiEnvironment } from '@/hooks/use-api-environment';

function CustomWidget() {
  const { 
    currentEnvironment, 
    config, 
    isLocal, 
    isProduction, 
    switchEnvironment,
    isDevelopment 
  } = useApiEnvironment();
  
  if (!isDevelopment) return null;
  
  return (
    <div>
      <p>Current: {currentEnvironment}</p>
      <p>API URL: {config.base}</p>
      <button onClick={() => switchEnvironment('production')}>
        Switch to Production
      </button>
    </div>
  );
}
```

**Returns:**
- `currentEnvironment: 'local' | 'production'` - Current API environment
- `config: { environment, base, analytics, isLocal, isProduction }` - Full API config
- `isLocal: boolean` - Convenience flag for local environment
- `isProduction: boolean` - Convenience flag for production environment
- `switchEnvironment: (env) => void` - Function to switch environment (triggers page reload)
- `isDevelopment: boolean` - True if NODE_ENV === 'development'

## Setup Requirements

Requires an API config file at `@/config/api.config.ts` with:

```typescript
export type ApiEnvironment = 'local' | 'production';

export function getApiConfig(): {
  environment: ApiEnvironment;
  base: string;
  analytics: string;
  isLocal: boolean;
  isProduction: boolean;
}

export function setApiEnvironment(env: ApiEnvironment): void
```

## How It Works

1. Widget only renders when `NODE_ENV === 'development'`
2. Current environment read from `localStorage.getItem('apiEnvironment')`
3. Switching calls `setApiEnvironment()` which:
   - Updates localStorage
   - Reloads the page to apply changes
4. On mount, config syncs with `getApiConfig()`

## Portability

This component is designed to be portable:
- No tight coupling to your specific project
- Only requires a standard API config contract
- All styling uses Tailwind CSS classes
- Can be dropped into any Next.js project with minimal setup

## Backward Compatibility

The old `_api-environment-switcher.tsx` file now re-exports the new components, so existing imports continue to work:

```tsx
// Both still work
import { ApiEnvironmentSwitcher } from '@/components/_api-environment-switcher';
import { ApiEnvironmentWidget } from '@/components/api-environment-widget';
```
