# Animation System Documentation

## Overview

This animation system provides a comprehensive solution for managing animations across the application with proper sequencing, staggering, and performance optimizations.

## Key Features

- **Sequential Animations**: Automatically manages delays between elements
- **Staggered Lists**: Proper staggering for list items and grids
- **View Transitions**: Smooth page transitions using the View Transitions API
- **Performance Optimized**: Respects `prefers-reduced-motion` settings
- **Type Safe**: Full TypeScript support

## Core Components

### Animation Manager

The `AnimationManager` singleton handles global animation state:

```typescript
import { animationManager, resetAnimations } from '@/lib/animations';

// Reset delays for new page
resetAnimations();

// Get next sequential delay
const delay = animationManager.getNextDelay();
```

### Animation Variants

Pre-defined animation variants for consistent motion:

- `fadeInUp`: Fade in from bottom with blur
- `fadeInLeft`: Fade in from left with blur
- `scaleIn`: Scale in with fade
- `listItem`: Optimized for list items
- `pageTransition`: Full page transitions

## Usage Examples

### Sequential Animations

```tsx
import { useSequentialAnimation, SequentialAnimation } from '@/lib/animations';

// Using hooks
const MyComponent = () => {
  const animation = useSequentialAnimation('fadeInUp');
  
  return (
    <motion.div {...animation}>
      Content appears in sequence
    </motion.div>
  );
};

// Using components
const MyComponent = () => (
  <SequentialAnimation variant="fadeInUp">
    Content appears in sequence
  </SequentialAnimation>
);
```

### Staggered Lists

```tsx
import { StaggeredList, StaggeredItem } from '@/lib/animations';

const ProjectList = ({ projects }) => (
  <StaggeredList staggerDelay={0.1} delayChildren={0.2}>
    {projects.map((project, index) => (
      <StaggeredItem key={project.id} index={index}>
        <ProjectCard project={project} />
      </StaggeredItem>
    ))}
  </StaggeredList>
);
```

### Page Transitions

```tsx
import { PageTransition } from '@/lib/animations';

const MyPage = () => (
  <PageTransition>
    <h1>Page Content</h1>
    <p>This will animate in smoothly</p>
  </PageTransition>
);
```

### View Transitions (Navigation)

```tsx
import { ViewTransitionLink } from '@/lib/animations';

const Navigation = () => (
  <ViewTransitionLink href="/about">
    About Page
  </ViewTransitionLink>
);
```

## Animation Timing

The system uses carefully tuned timing values:

- **Base delay**: 0.1s between sequential elements
- **Stagger increment**: 0.05s between list items
- **Duration**: 0.6s for main animations, 0.4s for list items
- **Easing**: `cubic-bezier(0.4, 0.0, 0.2, 1)` for natural motion

## Performance Considerations

### Reduced Motion

The system automatically respects `prefers-reduced-motion: reduce`:

- Animations are simplified to basic opacity changes
- Durations are reduced to 0.1s
- Complex transforms are disabled

### GPU Acceleration

All animations use GPU-accelerated properties:

- `transform` instead of changing layout properties
- `opacity` for fade effects
- `filter: blur()` for focus effects

## Migration Guide

### From Old System

Replace old animation configs:

```tsx
// Old
import { ANIMATION_CONFIGS } from '@/modules/shared';
<motion.div {...ANIMATION_CONFIGS.fadeInUp} />
<motion.div {...ANIMATION_CONFIGS.staggered(0.1)} />

// New
import { useSequentialAnimation } from '@/lib/animations';
const animation = useSequentialAnimation('fadeInUp');
<motion.div {...animation} />
```

### Staggered Lists

Replace manual stagger calculations:

```tsx
// Old
{items.map((item, index) => (
  <motion.div 
    key={item.id}
    {...ANIMATION_CONFIGS.staggered(index * 0.1)}
  >
    {item.content}
  </motion.div>
))}

// New
<StaggeredList>
  {items.map((item, index) => (
    <StaggeredItem key={item.id} index={index}>
      {item.content}
    </StaggeredItem>
  ))}
</StaggeredList>
```

## Best Practices

1. **Reset on Page Load**: Always call `resetAnimations()` when a new page loads
2. **Use Sequential for Sections**: Use sequential animations for main page sections
3. **Use Staggered for Lists**: Use staggered animations for any list of items
4. **Consistent Timing**: Stick to the predefined timing values
5. **Test Reduced Motion**: Always test with reduced motion enabled

## Browser Support

- **View Transitions**: Chrome 111+, Safari 18+
- **Framer Motion**: All modern browsers
- **Fallbacks**: Graceful degradation for unsupported features

## Troubleshooting

### Animations Not Working

1. Check if `prefers-reduced-motion` is enabled
2. Ensure `resetAnimations()` is called on page load
3. Verify Framer Motion is properly installed

### Performance Issues

1. Limit concurrent animations (max 10-15 elements)
2. Use `will-change: transform` sparingly
3. Avoid animating layout properties

### Timing Issues

1. Use the animation manager for consistent delays
2. Don't mix manual delays with sequential animations
3. Reset animations between page navigations