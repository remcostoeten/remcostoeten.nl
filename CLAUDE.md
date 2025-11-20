# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 portfolio blog starter with MDX support, built with modern web technologies and optimized for performance and SEO. The project includes a personal portfolio site with an integrated blog functionality.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans and Geist Mono
- **Content**: MDX for blog posts
- **Analytics**: Vercel Analytics and Speed Insights
- **Package Manager**: Uses npm (can also use bun or pnpm)

## Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Package Management

```bash
npm install          # Install dependencies
bun install          # Alternative package manager
pnpm install         # Alternative package manager
```

## Architecture and File Structure

### Dual Structure

This project has both `/app/` and `/src/app/` directories with similar content. The `/src/app/` version uses proper path aliases (`@/`) and should be preferred for new development.

### Key Directories

```
src/
├── app/
│   ├── blog/
│   │   ├── posts/           # MDX blog post files
│   │   ├── [slug]/page.tsx  # Dynamic blog post pages
│   │   └── page.tsx         # Blog listing page
│   ├── og/route.tsx         # Dynamic OG image generation
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage
│   └── global.css           # Global styles with Tailwind
├── components/
│   ├── nav.tsx              # Navigation component
│   ├── footer.tsx           # Footer component
│   ├── posts.tsx            # Blog posts listing
│   └── mdx.tsx              # MDX component rendering
└── modules/
    └── blog/
        └── repositories/
            └── utils.ts     # Blog content utilities
```

### Path Aliases

- `@/` maps to the `src/` directory
- Components are imported as `@/components/filename`
- App files are imported as `@/app/filename`

## Content Management

### Blog Posts

- Stored in `src/app/blog/posts/` as MDX files
- Each post requires frontmatter with `title`, `publishedAt`, and `summary`
- Posts are automatically parsed and displayed using the utility functions

### Frontmatter Example

```yaml
---
title: 'Your Post Title'
publishedAt: '2024-04-09'
summary: 'Brief description of the post'
---
```

## Key Features

### SEO Optimization

- Automatic sitemap generation (`/sitemap.ts`)
- OpenGraph metadata configuration
- Robots.txt configuration
- JSON-LD schema support

### Styling System

- Tailwind CSS v4 with custom CSS variables
- Dark mode support via `dark:` classes
- Custom prose styles for blog content
- Syntax highlighting with CSS variables

### Performance Features

- Font optimization with Geist fonts
- Responsive design with max-width container
- Optimized images and lazy loading
- Analytics integration

## Development Guidelines

### Code Style

- TypeScript with relaxed strict mode (`strict: false`)
- React functional components with hooks
- Tailwind classes for styling
- MDX for content authoring

### Import Patterns

```typescript
// Use path aliases for src imports
import { Component } from '@/components/component'
import { utility } from '@/modules/blog/repositories/utils'

// Relative imports for app-local files
import './global.css'
```

### Component Patterns

- Server components by default (no 'use client')
- Client components only when needed for interactivity
- Shared components in `/src/components/`
- Page-specific components co-located with routes

## Configuration Files

### TypeScript Configuration

- Base URL configured for path aliases
- React JSX transform enabled
- Next.js plugin integration
- Incremental builds enabled

### Styling Configuration

- Tailwind CSS v4 with PostCSS integration
- Custom CSS variables for theming
- Dark mode color scheme support

## Common Development Tasks

### Adding New Blog Posts

1. Create new `.mdx` file in `src/app/blog/posts/`
2. Add required frontmatter (title, publishedAt, summary)
3. Write content in MDX format
4. Post will automatically appear in blog listing

### Modifying Layout

- Edit `src/app/layout.tsx` for global layout changes
- Update metadata in the same file
- Modify navigation in `src/components/nav.tsx`
- Update footer in `src/components/footer.tsx`

### Styling Changes

- Global styles in `src/app/global.css`
- Component-specific styles using Tailwind classes
- CSS variables defined in `:root` for theming

## Deployment

The project is configured for Vercel deployment with:

- Automatic builds on push
- Analytics integration
- Performance monitoring
- Edge network optimization
