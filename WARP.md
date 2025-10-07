# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Reference

- [Quickstart](#quickstart)
- [Monorepo Layout](#monorepo-layout)
- [Development Commands](#development-commands)
- [Architecture & Conventions](#architecture--conventions)
- [Functional Factories](#functional-factories)
- [Database Operations](#database-operations)
- [Component Architecture](#component-architecture)
- [Blog System](#blog-system)
- [Analytics](#analytics)
- [Troubleshooting](#troubleshooting)

## Quickstart

1. **Install dependencies**: `bun install`
2. **Start frontend**: `cd apps/frontend && bun run dev`
3. **Start backend**: `cd apps/backend && bun run dev`
4. **Both simultaneously**: `bun run dev` (from root)
5. **Set up database**: Copy `.env.example` → `.env` in `apps/backend/` and set `DATABASE_URL`

## Monorepo Layout

```
├── apps/
│   ├── frontend/           # Next.js 15 blog application (port 3000)
│   └── backend/            # Hono.js API with analytics (port 4001)
├── packages/
│   └── crud-builder/       # @remcostoeten/drizzleasy - CRUD factory utilities
├── fresh/                  # Separate Next.js project
└── scripts/               # Deployment and utility scripts
```

**Workspaces**: `apps/*` (defined in root `package.json`)

## Development Commands

### Root Commands
```bash
bun install                          # Install all workspace dependencies
bun run dev                         # Start both frontend + backend
bun run build                       # Build both applications
bun run clean                       # Clean all build artifacts
bun run deploy                      # Deploy to production
```

### Frontend (apps/frontend)
```bash
cd apps/frontend
bun run dev                         # Development server (port 3000)
bun run build                       # Production build
bun run start                       # Start production build
bun run lint                        # ESLint
bun run blog:sync                   # Sync blog metadata
bun run blog:list                   # List blog posts
bun run blog:create                 # Create new blog post
```

### Backend (apps/backend)
```bash
cd apps/backend
bun run dev                         # Development server with hot reload (port 4001)
bun run build                       # Build for production
bun run start                       # Start production server
bun run gen                         # Generate Drizzle migrations
bun run push                        # Push schema changes to database
```

### CRUD Builder Package (packages/crud-builder)
```bash
cd packages/crud-builder
bun run build                       # Build the package
bun run test                        # Run tests
bun run dev                         # Watch mode for development
```

## Architecture & Conventions

### Code Style Rules (CRITICAL - Enforced)

**Functional Programming Only**:
- ✅ Use `function` declarations only: `function doSomething() {}`
- ❌ No classes, `extends`, `new`, `this`, or arrow functions
- ✅ Pure functions, immutability, composition over inheritance

**Exports**:
- ✅ Named exports for all modules: `export function MyComponent() {}`
- ❌ Default exports forbidden **except** for Next.js pages and views
- ✅ Pages may use default exports **only**

**TypeScript**:
- ✅ Use `type` aliases exclusively - never `interface`
- ✅ All type names prefixed with `T`: `TUser`, `TProps`, `TBlogPost`
- ✅ Single non-exported type per file → name it `TProps`

**Comments**:
- ❌ No inline or block comments in code
- ✅ Write self-explanatory code with clear naming
- ✅ Only comment truly obscure syntax when unavoidable

**Testing**:
- ❌ Do not write tests unless explicitly requested

## Functional Factories

### Core Pattern
Factories handle CRUD operations with Drizzle ORM, keeping business logic separate.

**Base Types**:
```typescript
type TTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type TBaseEntity = {
  id: number;
} & TTimestamps;
```

**Factory Template**:
```typescript
export function createBlogMetadataService() {
  return {
    async create(data: TCreateBlogMetadataData): Promise<TBlogMetadata> {
      const [result] = await db.insert(blogMetadata).values(data).returning();
      return result;
    },

    async read(filters?: TBlogMetadataFilters): Promise<TBlogMetadata[]> {
      return await db.select().from(blogMetadata).where(eq(...));
    },

    async update(slug: string, data: TUpdateBlogMetadataData): Promise<TBlogMetadata | null> {
      const [result] = await db.update(blogMetadata).set(data).where(eq(blogMetadata.slug, slug)).returning();
      return result || null;
    },

    async destroy(slug: string): Promise<boolean> {
      const [result] = await db.delete(blogMetadata).where(eq(blogMetadata.slug, slug)).returning();
      return result !== undefined;
    }
  };
}
```

**Rules**:
- Factories return objects with `{ create, read, update, destroy }` async functions
- Export factory functions as named exports only
- Return full entities after create/update operations
- No raw SQL - use Drizzle query builder exclusively
- Business logic stays outside factories

## Database Operations

### Configuration
- **Config**: `apps/backend/drizzle.config.ts`
- **Driver**: PostgreSQL with `@neondatabase/serverless`
- **Schema**: `apps/backend/src/schema/*.ts`
- **Database URL**: `DATABASE_URL` environment variable

### Migration Workflow
```bash
cd apps/backend

# Generate migrations after schema changes
bun run gen

# Apply migrations to database
bun run push
```

### Common Operations
```typescript
// Insert with returning
const [user] = await db.insert(users).values(userData).returning();

// Select with filtering
const posts = await db.select()
  .from(blogMetadata)
  .where(eq(blogMetadata.status, 'published'))
  .orderBy(desc(blogMetadata.publishedAt));

// Update with returning
const [updated] = await db.update(blogMetadata)
  .set({ title: 'New Title' })
  .where(eq(blogMetadata.slug, slug))
  .returning();

// Transactions
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values(userData).returning();
  await tx.insert(profiles).values({ userId: user[0].id });
});
```

## Component Architecture

### Pages vs Views Pattern
This codebase uses a strict separation between pages and views:

**Pages** (`app/*/page.tsx`):
- Contain NO logic - only render a View component and return metadata
- May use default exports (Next.js requirement)
- Handle server-side data fetching and pass to views

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await getAllBlogPosts();
  return <PostsView posts={posts} />;
}
```

**Views** (`src/views/*-view.tsx`):
- Named with `*-view.tsx` convention
- Handle all UI logic and interactions
- Must use named exports
- No barrel files in views directory

```typescript
// src/views/posts-view.tsx
type TProps = {
  posts: TBlogPost[];
};

export function PostsView({ posts }: TProps) {
  return (
    <div>
      {posts.map((post) => (
        <BlogPostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

### Component Rules
- **Props**: Must be explicitly typed using `TProps` when it's the single local type
- **Exports**: Named exports only for components
- **Functions**: Use function declarations, never arrow functions
- **Client Components**: Add `'use client'` only when necessary

## Blog System

### Content Structure
- **Location**: MDX files in filesystem (not in repo, loaded via filesystem utils)
- **Routing**: Dynamic routes via `app/posts/[slug]/page.tsx`
- **Processing**: `@next/mdx` with `remark-gfm` and `rehype-highlight`

### Adding New Posts
1. Create MDX file with required frontmatter:
```markdown
---
title: "Your Post Title"
publishedAt: "2024-01-15"
excerpt: "Brief description"
tags: ["react", "nextjs"]
category: "development"
published: true
---

# Your Content Here
```

2. Run blog sync: `cd apps/frontend && bun run blog:sync`

### Blog Scripts
```bash
bun run blog:list              # List all posts
bun run blog:create           # Interactive post creation
bun run blog:sync             # Sync metadata to backend
bun run blog:watch            # Watch for content changes
```

## Analytics

### Providers Used
- **Vercel Analytics**: `@vercel/analytics/next`
- **Speed Insights**: `@vercel/speed-insights/next`
- **Custom Backend**: Blog views tracked via Hono.js backend

### View Tracking
The backend provides blog analytics via the pageviews API:

```typescript
// Increment view count (handled automatically)
POST /api/blog/views/increment

// Get view statistics  
GET /api/blog/views/stats

// Get views for specific post
GET /api/blog/views/:slug
```

### Client Integration
```typescript
// Custom hook for view counting
function useBlogViews(slug: string) {
  // Automatically tracks views and provides count
}
```

## Troubleshooting

### Common Issues

**Bun Workspace Problems**:
- Run `bun install` from repository root
- If packages aren't linking, delete `node_modules` and reinstall

**Database Connection**:
- Verify `DATABASE_URL` is set in `apps/backend/.env`
- Check Neon/PostgreSQL connection string format
- Run `bun run gen && bun run push` to sync schema

**Build Failures**:
- Frontend: Check Next.js config and MDX processing
- Backend: Verify Drizzle config and schema files
- Clean builds: `bun run clean` then rebuild

**MDX/Blog Issues**:
- Run `bun run blog:sync` after adding posts
- Check frontmatter format matches requirements
- Verify file paths and slug generation

### Environment Setup
```bash
# Backend environment (.env in apps/backend/)
DATABASE_URL="postgresql://user:pass@host:port/db"
CORS_ORIGINS="http://localhost:3000,https://your-domain.com"
PORT=4001

# Frontend environment (.env.local in apps/frontend/)
NEXT_PUBLIC_API_URL="http://localhost:4001"
```

## Contributor Checklist

Before submitting code:

- ✅ Use `bun` exclusively (never npm/yarn)
- ✅ Follow functional style - no classes or arrow functions  
- ✅ Use named exports only (except pages/views default exports)
- ✅ Pages contain no logic - render Views only
- ✅ Use `type` aliases with `T` prefix
- ✅ Use `TProps` for single local type in files
- ✅ Keep factories pure - no business logic inside
- ✅ No inline comments - write self-explanatory code
- ✅ Don't add tests unless explicitly requested
- ✅ Don't create `$FEATURENAME.md` files after features

---

**Package Manager**: Use `bun` exclusively for all operations in this repository.