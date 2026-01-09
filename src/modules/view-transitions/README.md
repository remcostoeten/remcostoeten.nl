# View Transitions Module

Native view transitions system using Next.js's built-in View Transitions API and React 19's `<ViewTransition>` component.

## Features

- ✅ Browser-native View Transitions API
- ✅ Next.js experimental view transitions support (`experimental.viewTransition: true`)
- ✅ React 19.2.0+ `<ViewTransition>` component support
- ✅ Centralized configuration with toggleable options
- ✅ Multiple transition types (fade, slide, scale)
- ✅ Shared element transitions via `viewTransitionName`
- ✅ Automatic transitions on route navigation

## Configuration

Edit `src/modules/view-transitions/config.ts` to customize transitions:

```typescript
export const viewTransitionsConfig = {
    enabled: true,              // Enable/disable globally
    type: 'fade',              // 'fade' | 'slide' | 'scale' | 'none'
    duration: {
        fade: 300,
        slide: 400,
        scale: 300,
    },
    easing: {
        fade: 'cubic-bezier(0, 0, 0.2, 1)',
        slide: 'cubic-bezier(0.4, 0, 0.2, 1)',
        scale: 'cubic-bezier(0.4, 0, 1, 1)',
    },
    fadeOut: true,
    fadeIn: true,
    fadeInDelay: 90,
    sharedElements: true,
}
```

### Transition Types

- **`fade`** (default): Smooth opacity transition
- **`slide`**: Slide animation with opacity
- **`scale`**: Scale animation with opacity
- **`none`**: Disable transitions

## How It Works

1. **Next.js Config**: `experimental.viewTransition: true` in `next.config.ts` enables automatic view transitions
2. **Template**: `template.tsx` wraps all pages with React's `<ViewTransition>` component (if enabled)
3. **Styles**: CSS animations defined in `styles.css` using `::view-transition-*` pseudo-elements
4. **Config**: Centralized configuration in `config.ts` controls behavior

## Usage

### Using ViewTransition Component

Import directly from React (no wrapper needed):

```tsx
import { ViewTransition } from 'react'

export default function Page() {
  return (
    <ViewTransition>
      <h1>My Page</h1>
    </ViewTransition>
  )
}
```

### Shared Element Transitions

Use `viewTransitionName` for shared elements across pages:

```tsx
<div style={{ viewTransitionName: 'hero-image' }}>
  <img src="/hero.jpg" alt="Hero" />
</div>
```

### Disabling Transitions

1. Set `enabled: false` in `config.ts`, OR
2. Remove `experimental.viewTransition` from `next.config.ts`

## Customization

1. **Change transition type**: Edit `type` in `config.ts`
2. **Adjust duration**: Modify `duration` values in `config.ts`
3. **Custom easing**: Update `easing` functions in `config.ts`
4. **Advanced styles**: Edit `styles.css` for custom animations
