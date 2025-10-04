# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

This is a monorepo containing a personal blog and analytics platform with:
- **Frontend**: Next.js 14 blog with MDX support (`apps/frontend/`)
- **Backend**: Hono.js API for analytics and blog metadata (`apps/backend/`)
- **Packages**: Shared packages including `@remcostoeten/drizzleasy` CRUD builder (`packages/crud-builder/`)

## Essential Commands

### Development
```bash
# Start both frontend (port 3000) and backend (port 4001)
bun run dev:bun

# Start individually
cd apps/frontend && bun run dev
cd apps/backend && bun run dev
```

### Blog Management
```bash
cd apps/frontend

# Sync blog metadata with backend
bun run blog:sync

# Watch for MDX changes and auto-sync
bun run blog:watch

# Create new blog post
bun run blog:create

# List all blog posts
bun run blog:list

# Set up Git hooks for automation
bun run blog:hooks
```

### Database Operations
```bash
cd apps/backend

# Generate database migrations
bun run gen

# Push database changes
bun run push
```

### Building & Deployment
```bash
# Build both applications
bun run build

# Deploy backend to Fly.io
cd apps/backend && flyctl deploy

# Clean all build artifacts
bun run clean
```

## Architecture & Code Organization

### Frontend (`apps/frontend/`)
- **App Router**: Pages in `src/app/` following Next.js App Router conventions
- **Views Pattern**: Pages only return views from `src/views/`, no logic in page files
- **Components**: Organized in `src/components/` with feature-based subdirectories
- **Blog Content**: MDX files in `content/blog/` with automated metadata sync
- **Modules**: Feature modules in `src/modules/` for complex functionality

### Backend (`apps/backend/`)
- **Routes**: API endpoints in `src/routes/` (blog, pageviews, visitors)
- **Services**: Business logic in `src/services/` with hybrid storage pattern
- **Schema**: Drizzle ORM schemas in `src/schema/`
- **Storage**: Hybrid storage supporting both PostgreSQL and in-memory

### Key Architectural Patterns

1. **Functional Factories**: CRUD operations use factory functions returning objects with named async functions
   ```typescript
   function createFactory<T>(table) {
     return {
       async create(data: T) { /* ... */ },
       async read(id: string) { /* ... */ },
       async update(id: string, data: Partial<T>) { /* ... */ },
       async destroy(id: string) { /* ... */ }
     }
   }
   ```

2. **Type Naming**: All types prefixed with `T`, single non-exported types named `TProps`
   ```typescript
   type TProps = { /* component props */ }
   type TUser = { /* user entity */ }
   ```

3. **No Classes/Arrow Constants**: Use named functions only
   ```typescript
   // ✅ Good
   function doSomething() {}
   
   // ❌ Bad
   const doSomething = () => {}
   class SomeClass {}
   ```

4. **Named Exports Only**: Except for Next.js pages and views
   ```typescript
   // ✅ Good
   export function MyComponent() {}
   
   // ❌ Bad (except in pages/views)
   export default function MyComponent() {}
   ```

## Blog System Workflow

1. **Creating Posts**: Add MDX files to `frontend/content/blog/` with required frontmatter
2. **Metadata Sync**: Automatic sync via file watcher, Git hooks, or manual command
3. **Analytics**: Blog views tracked through backend API with visitor fingerprinting
4. **Deployment**: Frontend to Vercel/Netlify, backend to Fly.io

## API Endpoints

### Production Backend
- **Base URL**: `https://analytics-api-backend.fly.dev`
- **Health Check**: `GET /health`
- **Blog Metadata**: Full CRUD at `/api/blog/metadata`
- **Visitor Tracking**: `/api/visitors/track-visitor`, `/api/visitors/track-blog-view`
- **Pageviews**: `/api/pageviews` for tracking and stats

### Environment Configuration
```bash
# Backend (.env)
DATABASE_URL="postgresql://..."
STORAGE_TYPE="database"  # or "memory" for dev
PORT=4001

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE=http://localhost:4001/api
```

## Development Guidelines

1. **Package Manager**: Always use `bun`, fallback to `pnpm` if needed. Never use `npm` or `yarn`
2. **Code Style**: Self-explanatory code without comments, functional programming patterns
3. **State Management**: Use reducer functions for complex state logic
4. **Testing**: No tests unless explicitly requested
5. **Type Safety**: Strong TypeScript usage with proper type definitions

## Available Tools & CLIs
- GitHub CLI (`gh`)
- Context7 MCP for library documentation
- Vercel CLI (`vercel`)
- Turso CLI (`turso`)
- Neon.tech CLI (`neon`)
- Fly.io CLI (`flyctl`)

## Database Access

The backend supports multiple database configurations:
- **PostgreSQL**: Neon (production), local Docker (development)
- **SQLite**: Local file storage for development
- **Turso**: Edge database with auth token
- **Memory**: In-memory storage for testing

Connection initialization uses the `@remcostoeten/drizzleasy` package for simplified setup.