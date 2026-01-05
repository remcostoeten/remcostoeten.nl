# Dev Menu

A modular, configurable developer menu component for Next.js projects.

## Features

- **Modular Architecture**: Toggle sections on/off based on your needs
- **Corner Positioning**: Widget can be positioned in any corner
- **Session Aware**: Optional auth section that only shows when authenticated
- **Route Navigation**: Quick access to all your app routes
- **System Info**: View environment and debug info
- **Keyboard Shortcut**: Toggle widget with `~` (backtick) key
- **Customizable**: Configure which sections to show per project

## Installation

The component is located at `tools/dev-menu/` and can be imported from anywhere in your project.

## Usage

### Basic Usage (with all sections enabled)

```tsx
import { DevWidget } from '@/tools/dev-menu'
import { useSession } from '@/lib/auth-client'

function MyComponent() {
  const { data: session } = useSession()

  return (
    <DevWidget
      session={session}
      onSignOut={signOut}
    />
  )
}
```

### Minimal Usage (no auth, just routes)

```tsx
import { DevWidget } from '@/tools/dev-menu'

function MyComponent() {
  return (
    <DevWidget
      showAuth={false}
      showSystemInfo={false}
      routes={['/', '/about', '/contact']}
    />
  )
}
```

### Routes Only (no auth, no settings, no system info)

```tsx
<DevWidget
  showAuth={false}
  showRoutes={true}
  showSystemInfo={false}
  showSettings={false}
  routes={['/page1', '/page2', '/page3']}
/>
```

## Props

```typescript
interface DevWidgetProps {
  session?: Session | null      // Auth session (optional)
  onSignOut?: () => void       // Sign out handler (optional)
  showAuth?: boolean           // Show auth section (default: true)
  showRoutes?: boolean          // Show routes section (default: true)
  showSystemInfo?: boolean      // Show system info (default: true)
  showSettings?: boolean        // Show settings popover (default: true)
  routes?: string[]           // List of routes to display
  customTitle?: string        // Custom widget title
  isAdmin?: boolean          // Force admin mode (default: false)
}
```

## Section Visibility Examples

### Project with Auth
```tsx
<DevWidget
  session={session}
  onSignOut={signOut}
  showAuth={true}
  showRoutes={true}
  showSystemInfo={true}
/>
```

### Project without Auth (e.g., public site)
```tsx
<DevWidget
  showAuth={false}
  showRoutes={true}
  showSystemInfo={true}
/>
```

### Minimal (only routes)
```tsx
<DevWidget
  showAuth={false}
  showRoutes={true}
  showSystemInfo={false}
  showSettings={false}
  routes={['/', '/about', '/contact']}
/>
```

## Custom Routes

You can pass your own array of routes:

```tsx
const myRoutes = [
  '/',
  '/dashboard',
  '/settings',
  '/api/health',
]

<DevWidget routes={myRoutes} />
```

## Available Exports

```typescript
// Main widget
import { DevWidget } from '@/tools/dev-menu'

// Individual sections (if you want to use them separately)
import { AuthSection } from '@/tools/dev-menu'
import { RoutesSection } from '@/tools/dev-menu'
import { SystemInfoSection } from '@/tools/dev-menu'
import { SettingsPopover } from '@/tools/dev-menu'

// Types
import type { DevWidgetConfig, Corner, Session } from '@/tools/dev-menu'
```

## Architecture

```
tools/dev-menu/
├── components/
│   ├── DevWidget.tsx          # Main widget container
│   ├── types.ts               # TypeScript types
│   └── sections/
│       ├── AuthSection.tsx      # User auth display & logout
│       ├── RoutesSection.tsx    # Route list & navigation
│       ├── SystemInfoSection.tsx  # Environment & debug info
│       └── SettingsPopover.tsx  # Corner selection popover
└── index.ts                   # Barrel export
```

## Customization

Each section can be toggled independently:

- `showAuth` - Requires `session` prop, shows user info & logout
- `showRoutes` - Requires `routes` prop (defaults to common routes)
- `showSystemInfo` - Shows NODE_ENV, admin email, user agent
- `showSettings` - Shows settings cog for corner positioning

## Styling

The widget uses:
- Tailwind CSS classes
- Framer Motion for animations
- Custom scrollbar styling (included in component)
- Dark theme (zinc/black color palette)
