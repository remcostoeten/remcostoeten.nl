# Component Documentation

This directory contains comprehensive documentation for UI components.

## ButtonLink Component

The ButtonLink component is a versatile button/link component that adapts its rendering based on props and provides comprehensive accessibility features.

### Quick Links

- **[Main Documentation](./ButtonLink.md)** - Overview, API, and basic examples
- **[Usage Examples](./ButtonLink-Examples.md)** - Comprehensive examples and patterns  
- **[Accessibility Guide](./ButtonLink-Accessibility.md)** - Detailed accessibility documentation

### Quick Reference

#### Props
```tsx
type TProps = {
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'admin'
  readonly size?: 'sm' | 'md' | 'lg'
  readonly loading?: boolean
  readonly disabled?: boolean
  readonly class?: string
  readonly children: JSX.Element
  readonly href?: string
} & JSX.ButtonHTMLAttributes<HTMLButtonElement> & JSX.AnchorHTMLAttributes<HTMLAnchorElement>
```

#### Basic Usage
```tsx
// Button
<ButtonLink variant="primary" onClick={handleClick}>
  Save Changes
</ButtonLink>

// Link
<ButtonLink variant="secondary" href="/dashboard">
  Go to Dashboard
</ButtonLink>

// Loading state
<ButtonLink loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</ButtonLink>
```

#### Key Features
- **Dual Rendering**: Renders as `<button>` or `<a>` based on `href` prop
- **Multiple Variants**: 5 visual styles (primary, secondary, ghost, destructive, admin)
- **Three Sizes**: Small, medium (default), and large
- **Loading States**: Built-in loading spinner and disabled interaction
- **Accessibility**: Full keyboard navigation, ARIA attributes, screen reader support
- **TypeScript**: Fully typed with comprehensive prop definitions

### Storybook

The component includes comprehensive Storybook stories demonstrating all features:

- All variants and sizes
- Loading and disabled states  
- Accessibility examples
- Real-world usage patterns
- Interactive controls for testing

### Testing

The component is thoroughly tested with:
- Unit tests for all props and behaviors
- Accessibility testing for keyboard navigation
- Screen reader compatibility tests
- Visual regression tests via Storybook

### File Structure

```
src/components/ui/
├── ButtonLink.tsx           # Main component
├── ButtonLink.test.tsx      # Comprehensive tests
└── ButtonLink.stories.tsx   # Storybook stories

docs/components/
├── README.md                # This file
├── ButtonLink.md            # Main documentation
├── ButtonLink-Examples.md   # Usage examples
└── ButtonLink-Accessibility.md # Accessibility guide
```
