# CMS Configuration System

This directory contains a centralized configuration system for all CMS-editable design tokens, including colors, typography, spacing, shadows, and more.

## Structure

- `types.ts` - TypeScript type definitions for all design tokens
- `cms-config.ts` - Default configuration values and utility functions
- `cms-config.cjs` - CommonJS version for Tailwind integration
- `example-usage.tsx` - Example component showing how to use the configuration

## Key Features

### 1. Centralized Design Tokens
All design-related variables are stored in a single configuration object:
- Colors (primary, secondary, accent, semantic colors)
- Typography (font families, sizes, weights, line heights)
- Spacing values
- Border radius values
- Shadows
- Breakpoints
- Transitions and animations
- Z-index values
- Opacity values

### 2. Runtime CSS Variables
The configuration automatically generates CSS custom properties that can be used throughout the application:
```css
--background: hsl(0 0% 7%);
--foreground: hsl(0 0% 85%);
--primary: #4F46E5;
/* etc... */
```

### 3. Tailwind Integration
The configuration is integrated with Tailwind CSS, so all tokens are available as Tailwind utilities:
```jsx
<div className="bg-primary-500 text-lg p-4 rounded-lg shadow-md">
  Content
</div>
```

### 4. Reactive Updates
When configuration values are changed in the CMS, they are immediately applied to the page without requiring a rebuild.

## Usage

### In Components

#### Using the Design Tokens Context
```tsx
import { useDesignTokens } from '../context/design-tokens-context';

function MyComponent() {
  const { state } = useDesignTokens();
  const { tokens } = state;
  
  return (
    <div style={{ 
      padding: tokens.spacing[4],
      borderRadius: tokens.borderRadius.lg 
    }}>
      <h1 className="text-2xl font-bold">
        Using design tokens
      </h1>
    </div>
  );
}
```

#### Using Tailwind Classes
All tokens are available as Tailwind utilities:
```tsx
function MyComponent() {
  return (
    <div className="p-4 bg-background text-foreground rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary-500">
        Hello World
      </h1>
      <p className="text-base text-muted-foreground mt-2">
        This uses our design system tokens
      </p>
    </div>
  );
}
```

### In the CMS

The AdminCMS component will have a "Design" tab where administrators can:
1. Edit color values (with color pickers)
2. Adjust typography settings
3. Modify spacing values
4. Update shadows and border radius
5. Configure animations and transitions

All changes are saved to the database and immediately applied to the site.

## Adding New Tokens

To add new design tokens:

1. Add the type definition in `types.ts`
2. Add default values in `cms-config.ts` and `cms-config.cjs`
3. Update the `toCssVariables` function if CSS variables are needed
4. Update the `toTailwindTheme` function to expose them to Tailwind
5. Add corresponding Convex schema updates (if persisting to database)

## Best Practices

1. **Use semantic color names** - Instead of `blue-500`, use `primary-500`
2. **Keep tokens organized** - Group related tokens together
3. **Document token usage** - Add comments for non-obvious token purposes
4. **Test responsive behavior** - Ensure tokens work across all breakpoints
5. **Maintain consistency** - Use the configuration system for all design values

## Migration Guide

When migrating existing components:

1. Replace hard-coded values with token references
2. Replace inline styles with Tailwind classes where possible
3. Use the context hook for dynamic values
4. Test that components respond to configuration changes

## Example Migration

Before:
```tsx
<div style={{ 
  padding: '16px', 
  backgroundColor: '#171717',
  borderRadius: '8px' 
}}>
```

After:
```tsx
<div className="p-4 bg-background rounded">
```

Or with dynamic values:
```tsx
const { state } = useDesignTokens();
<div style={{ 
  padding: state.tokens.spacing[4],
  backgroundColor: state.tokens.colors.background,
  borderRadius: state.tokens.borderRadius.DEFAULT
}}>
```
