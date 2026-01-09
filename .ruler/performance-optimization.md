# Performance Optimization Rules

## Font Loading

- Use local fonts over Google Fonts when possible.
- Set `display: 'optional'` for primary fonts to prevent CLS.
- Set `display: 'swap'` for secondary fonts.
- Preload only critical fonts.
- Use `woff2` format for best compression.
- Include comprehensive font fallbacks.

## Bundle Optimization

- Keep First Load JS under 70kb for instant hydration.
- Use dynamic imports for non-critical components.
- Split metadata into static and dynamic parts.
- Implement proper code splitting boundaries.
- Avoid large dependencies in shared layouts.
- Use route segments for granular chunking.

## Image Optimization

- Use `next/image` with `priority` for LCP images.
- Implement blur placeholder for images.
- Preload critical images.
- Use responsive `sizes` attribute.
- Optimize image formats (WebP/AVIF).

## Component Optimization

- Use `React.memo()` for expensive renders.
- Implement proper suspense boundaries.
- Keep component bundles under 50kb.
- Use CSS Modules for scoped styling.
- Implement proper lazy loading boundaries.

## General Performance Guidelines

- Avoid heavy computations without memoization
- Use client-side navigation sparingly for critical paths
- Implement proper caching strategies
- Monitor Core Web Vitals
- Use semantic HTML for better accessibility and performance
- Implement proper error boundaries
- Optimize for mobile-first approach
