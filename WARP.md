# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview & Tech Stack

This is a **Portfolio Site with Admin CMS**, built with React 19 and Convex as the backend. The project implements a content management system that allows dynamic configuration of site settings, page content, and theme customization through a visual interface.

**Core Technologies:**
- **Frontend**: React 19, Vite 6.2, TypeScript 5.7
- **Backend**: Convex 1.24 (real-time database and API functions)
- **Styling**: Tailwind CSS 3, Radix UI components
- **State**: React hooks + Convex queries/mutations
- **Auth**: Convex Auth with Password & Anonymous providers
- **Package Manager**: Bun (primary), pnpm (fallback)

**Key Features:**
- Live CMS for site configuration and content management
- Dynamic theming with custom design tokens
- Drag-and-drop page builder interface
- User feedback submission system
- Real-time updates via Convex

## Quick-start Commands

| Command | Purpose | When to use |
|---------|---------|-------------|
| `bun dev` | Start development servers (frontend + backend) | Daily development |
| `bun run dev:frontend` | Start only Vite dev server | Frontend-only work |
| `bun run dev:backend` | Start only Convex dev | Backend-only work |
| `bun run build` | Build for production | Before deployment |
| `bun run lint` | Type check + validate + build | Pre-commit validation |

**Additional Commands:**
```bash
# Convex-specific
npx convex dev          # Start Convex development
npx convex deploy       # Deploy to production
npx convex dev --once   # Run schema migrations

# Vite-specific
bun run build && npx vite preview  # Preview production build
```

**Fallback with pnpm:**
```bash
pnpm dev
pnpm run build
```

## Architecture

This project follows a **React SPA + Convex Backend** architecture with real-time data synchronization:

```
Browser (React/Vite) → Convex Client → Convex Functions → Convex Database
                    ↑                                  ↓
                    └── Real-time Updates ←───────────┘
```

**Data Flow:**
1. React components use Convex `useQuery`/`useMutation` hooks
2. Convex client communicates with deployed backend (`insightful-eel-218`)
3. Convex functions handle auth, CRUD operations, and business logic
4. Database changes trigger real-time UI updates

**Directory Structure:**
```
src/
├── components/          # React components (AdminCMS, UI, etc.)
├── config/             # CMS configuration & design tokens
├── context/            # React contexts (design tokens)
├── shared/             # Utilities, hooks, common code
└── main.tsx           # App entry point

convex/
├── schema.ts          # Database schema definition
├── auth.ts           # Authentication logic
├── site.ts           # Site config & content functions
├── submissions.ts    # Feedback system
└── _generated/       # Auto-generated Convex files
```

**CMS Architecture:**
- `AdminCMS` component provides tabbed interface for site management
- `siteConfig` table stores global settings, themes, and SEO data
- `pageContent` table stores page sections and widgets
- Real-time synchronization between CMS changes and live site

## Environment & Configuration

**Required Environment Variables:**
```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
ADMIN_EMAIL=admin@example.com  # Optional: defines admin access
```

**Convex Deployment:**
This project connects to the Convex deployment: `insightful-eel-218`
- Dashboard: https://dashboard.convex.dev/d/insightful-eel-218

**Design Tokens Integration:**
- Tailwind config extends with CSS custom properties
- Design tokens defined in `src/config/cms-config.ts`
- Live theme changes applied via `--background`, `--foreground`, etc.
- Supports real-time theme switching through CMS interface

## Development Workflow

**Starting Development:**
```bash
bun dev  # Starts both frontend (Vite) and backend (Convex)
```
This opens the app at `http://localhost:5173` with hot-reload enabled.

**Code Style:**
- ESLint configuration with TypeScript-strict rules
- Prettier for formatting (auto-sort Tailwind classes)
- No unused variables (warns), allows explicit `any`

**Testing:**
- No testing framework currently configured
- Manual testing via development server and CMS interface

## Key Coding Practices

**Export Rules:**
```tsx
// ✅ Correct - Named exports only
export function HomePage() { /* ... */ }
export function Button({ title }: TProps) { /* ... */ }

// ❌ Wrong - No default exports (except pages/views)
export default function Component() { /* ... */ }
```

**Type Conventions:**
```tsx
// ✅ Single type per file (non-exported) - must be named TProps
type TProps = {
  title: string;
  onClick?: () => void;
};

// ✅ All type names prefixed with T
type TUser = { id: string; name: string; };
type TSection = { id: string; widgets: TWidget[]; };

// ✅ Use type, never interface
type TConfig = { title: string; };
```

**Function Style:**
```tsx
// ✅ Correct - Function declarations
function processData(input: string) {
  return input.toUpperCase();
}

// ✅ Correct - Named async functions
async function fetchUser(id: string) {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
}

// ❌ Wrong - Arrow function constants
const processData = (input: string) => input.toUpperCase();
```

**State Management:**
- Use pure reducer functions for complex state
- Prefer `useReducer` over multiple `useState` calls
- Keep reducers separate from UI code

```tsx
type TAction = { type: 'increment' } | { type: 'reset'; payload: number };

function counterReducer(state: number, action: TAction): number {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'reset': return action.payload;
    default: return state;
  }
}
```

**No Comments Policy:**
- Code must be self-explanatory
- Use descriptive function/variable names instead of comments
- Only comment for non-standard or obscure syntax

## Backend (Convex) Guide

**Schema Location:**
All database tables defined in `convex/schema.ts`

**Key Tables:**
- `siteConfig`: Site settings, themes, SEO data
- `pageContent`: Page sections and widgets (indexed by `pageId`)
- `submissions`: User feedback/contact form data
- Auth tables: Auto-generated by `@convex-dev/auth`

**Function Syntax:**
```ts
// Query example
export const getSiteConfig = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteConfig").first();
  },
});

// Mutation example  
export const updateSiteConfig = mutation({
  args: {
    title: v.string(),
    bodyBgColor: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("siteConfig", args);
    }
  },
});
```

**Development Commands:**
- `npx convex dev` - Start development with schema sync
- `npx convex dev --once` - Run schema migrations only
- `npx convex deploy` - Deploy functions to production

## Frontend Guide

**Routing:**
- React Router DOM v7.8.1
- Routes defined in `src/app.tsx`:
  - `/` - HomePage component
  - `/admin/cms` - AdminCMS component

**Component Conventions:**
- All components use named exports
- Props typed with `TProps` (single type per file)
- Utility imports: `import { cn } from '@/shared/utilities/cn'`
- UI components: Available via `ui` alias (shadcn-style)

**State Management Pattern:**
- Convex `useQuery` for server state
- React `useState`/`useReducer` for local UI state
- Context for global UI state (design tokens)

**Styling:**
- Tailwind CSS with CSS custom properties
- Dynamic theming via CSS variables
- Component-scoped styles using `cn()` utility
- No custom CSS files (global styles only)

## CMS/Admin Specifics

**Admin Access:**
- Access CMS at `/admin/cms` route
- Admin privileges determined by `ADMIN_EMAIL` environment variable
- Anonymous auth enabled for easy development access

**CMS Features:**
- **Submissions Tab**: View user feedback/contact form submissions
- **Site Settings Tab**: Configure title, meta tags, global styles
- **Page Builder Tab**: Visual editor for page sections and widgets
- **Import/Export Tab**: JSON import/export of page configurations

**Tab Management:**
- Tab order stored in `siteConfig.cmsTabOrder`
- Drag-and-drop reordering supported
- Default tabs: submissions, site, content, import

**Design Tokens:**
- Live theme editing through CMS interface
- CSS custom properties updated in real-time
- Supports background, foreground, accent colors
- Design token definitions in `src/config/cms-config.ts`

## Environment & Deployment

**Local Development Setup:**
1. Install dependencies: `bun install`
2. Set up environment variables in `.env.local`
3. Start development: `bun dev`

**Production Deployment:**
- Build: `bun run build`
- Convex deployment: `npx convex deploy`
- Frontend deployment: Deploy `dist/` to Vercel/Netlify

**Convex Configuration:**
- Deployment name: `insightful-eel-218`
- Environment variables managed through Convex dashboard
- Schema migrations automatic on deploy

## Troubleshooting

**Common Issues:**

1. **Environment Variables Not Loading:**
   - Ensure `.env.local` exists with `VITE_CONVEX_URL`
   - Variables must be prefixed with `VITE_` for Vite access

2. **Convex Schema Errors:**
   - Run `npx convex dev --once` to apply schema changes
   - Check `convex/schema.ts` for proper table definitions

3. **TypeScript Errors:**
   - ESLint configured to allow `any` types for development ease
   - Check `tsconfig.json` paths are correct (`@/*` alias)

4. **Build Failures:**
   - `bun run lint` includes type checking and build validation
   - Ensure all imports resolve correctly

5. **Authentication Issues:**
   - Verify `ADMIN_EMAIL` matches user email for admin access
   - Anonymous auth is enabled for development

**Development Tips:**
- Use React DevTools for component inspection
- Convex dashboard provides real-time function logs
- Hot-reload works for both frontend and backend changes

## Key Files

- `package.json` - Dependencies and scripts
- `convex/schema.ts` - Database schema
- `src/app.tsx` - Main app component and routing
- `src/components/admin-cms.tsx` - CMS interface
- `src/config/cms-config.ts` - Design tokens and CMS config
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.ts` - Vite build configuration

---

For additional context, see:
- Convex documentation: https://docs.convex.dev/
- Project README.md for deployment instructions
- GEMINI.md for detailed coding standards
