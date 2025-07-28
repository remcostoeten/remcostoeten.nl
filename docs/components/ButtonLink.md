# ButtonLink Documentation

ButtonLink is a versatile component that supports different variants, sizes, loading states, and interaction via href or onClick. It provides accessibility features such as keyboard navigation and assistive technology integration.

## Overview

The ButtonLink component intelligently renders as either a `<button>` or `<a>` element based on the presence of an `href` prop. This dual-nature approach maintains semantic correctness while providing a consistent API for both button actions and navigation links.

**Key Features:**
- 🔄 **Dual Rendering**: Button or anchor based on props
- 🎨 **5 Variants**: Primary, secondary, ghost, destructive, admin
- 📏 **3 Sizes**: Small, medium, large
- ⏳ **Loading States**: Built-in spinner and disabled interaction
- ♿ **Accessibility**: Full keyboard navigation and ARIA support
- 🔤 **TypeScript**: Comprehensive type definitions

## Variants

- **Primary**: Used for primary actions.
- **Secondary**: Used for secondary actions.
- **Ghost**: For non-intrusive actions.
- **Destructive**: For actions that might cause data loss.
- **Admin**: Default variant.

## Sizes

- **Small (`sm`)**: Compact size.
- **Medium (`md`)**: Default size.
- **Large (`lg`)**: For emphasis.

## Href vs OnClick

- **Href**: Rendered as an anchor (`<a>`) if href is provided.
- **OnClick**: Rendered as a button (`<button>`) if no href is provided.

## Disabled/Loading States

- **Disabled**: Prevents interaction. Sets `aria-disabled` on anchors.
- **Loading**: Displays a spinner to indicate background processing.

## Technical Implementation

### Element Selection Logic
```tsx
const elementTag = local.href ? 'a' : 'button'
```
- **Button Element**: Used when no `href` prop is provided
- **Anchor Element**: Used when `href` prop is provided, with `role="button"`

### Loading State
When `loading={true}`:
- Renders animated SVG spinner
- Button/link becomes functionally disabled
- Visual feedback indicates processing state

### Disabled State Handling
- **Button elements**: Uses native `disabled` attribute
- **Anchor elements**: Uses `aria-disabled` and `tabindex="-1"`
- **Loading state**: Treated as disabled

## Accessibility

- **Keyboard Navigation**: Supports `Enter` and `Space` for activating links.
- **Aria Attributes**: Manages `role`, `aria-disabled`, and `tabindex` for correct semantics.
- **Focus Management**: Disabled elements are not focusable
- **Screen Reader Support**: Proper announcements for all states

## Examples

### Primary ButtonLink
```tsx
<ButtonLink variant="primary" onClick={handleClick}>
  Primary Button
</ButtonLink>
```

### Destructive Link
```tsx
<ButtonLink variant="destructive" href="/delete">
  Delete Item
</ButtonLink>
```

### Loading Button
```tsx
<ButtonLink loading>
  Processing...
</ButtonLink>
```

### Disabled Link
```tsx
<ButtonLink href="/test" disabled>
  Disabled Link
</ButtonLink>
```

### Sizes
```tsx
<ButtonLink size="sm">Small</ButtonLink>
<ButtonLink size="md">Medium</ButtonLink>
<ButtonLink size="lg">Large</ButtonLink>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive' \| 'admin'` | `'admin'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows loading spinner and disables interaction |
| `disabled` | `boolean` | `false` | Disables the button/link |
| `href` | `string` | `undefined` | URL for navigation (renders as anchor) |
| `class` | `string` | `undefined` | Additional CSS classes |
| `children` | `JSX.Element` | - | Button content |
| `onClick` | `(e: MouseEvent) => void` | `undefined` | Click handler |

### Styling Details

#### Variant Classes
- **Primary**: `bg-accent text-accent-foreground hover:bg-accent/90 focus:ring-accent`
- **Secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary`
- **Ghost**: `hover:bg-muted hover:text-foreground focus:ring-muted`
- **Destructive**: `bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive`
- **Admin**: `bg-background border-2 border-border hover:border-accent/50 text-foreground hover:-translate-y-0.5 focus:ring-accent`

#### Size Classes
- **Small**: `h-8 px-3 text-sm`
- **Medium**: `h-10 px-4`
- **Large**: `h-12 px-6 text-lg`

#### Base Classes
All buttons share these base classes:
```css
inline-flex items-center justify-center font-medium rounded-md transition-colors 
focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
```

