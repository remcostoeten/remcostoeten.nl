# AI Development Assistant Guidelines

This is a personal site, rebuild for maximium SEO, google ranking and mobile experience of <https://remcostoeten.nl> / <https://github.com/remcostoeten/remcostoeten.nl>. Keep SEO in mind - meaning we try to load everything SSR and all routes must have adequate metadata and comply to standards like containing a H1.

Important is post completion of a prompt to NEVER create a documentation summary in the project.

## 🚨 CRITICAL CODING RULES (READ FIRST - NO EXCEPTIONS)

### Function & Syntax Rules

- **ONLY** use `function foo() {}` syntax - NEVER arrow functions for regular operations
- **ONLY** use arrow `const` for memoization or callbacks
- **NEVER** use classes - functional programming only
- **ONLY** use `type` definitions - NEVER `interface`
- Props variable **MUST** be named `props` (no other names)
- Props types: max 2 words, self-explanatory
- **ONLY** kebab-case filenames
- Files used > ONCE go in `src/shared/`
- *AGGRESSIVE* implement `Suspense()`, `useCallback`, `useMemo`, `memo`, `lazyload` and codesplit to squeeze all performance out we can. Use ui skeleton pre loaders which match the UI 1:1 for fallback loaders.
- *PRIORITIZE* mobile responsiveness.
s

### Import Aliases

- Shadcn: `import { Button } from 'ui'` (barrel file at `src/shared/ui/index.ts`)
- Utilities: `import { cn } from 'utilities'` (barrel file at `src/shared/utilities/index.ts`)

### SEO Requirements

- Personal portfolio/blog - MAXIMUM SEO critical
- Use SSR as much as possible
- Minimal client-side code only

### Forbidden Patterns

- NO post-development documentation files (.mdx, .md, .txt)
- NO comments unless absolutely necessary (then use `@name`/`@description` format)
- NO classes, NO interfaces, NO arrow functions for regular operations

## 🎯 Core Principles

1. **Functional Programming First**: Use functions over classes, prefer immutable patterns
2. **Type Safety**: Maintain strong TypeScript typing throughout
3. **Performance First**: Keep bundles small, optimize for user experience
4. **Developer Experience**: Write clear, maintainable code with good documentation
5. **Security First**: Never expose sensitive data, follow security best practices

## 📁 Project Structure Overview

This project uses a dual structure with `/app/` and `/src/app/`. **Always prefer `/src/app/` for new development** as it uses proper path aliases (`@/`).

```
src/
├── app/                    # Next.js App Router (views only)
├── components/             # Reusable UI components
├── modules/               # Feature-specific code
│   └── {feature}/
│       ├── queries/       # Data fetching functions
│       ├── mutations/     # Data modification functions
│       ├── repositories/  # Data access layer
│       └── models/        # Validation schemas
├── shared/                # Cross-cutting concerns
│   ├── components/ui/     # Shared UI components
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
└── api/                  # Server-side code
    └── db/               # Database layer
```

## 🚨 Critical Rules (READ THESE FIRST)

### ❌ NEVER DO

- **Never access the database directly outside functional repositories**
- **Never use classes for application logic**
- **Never create `lib/`, `helpers/`, or `utilities/` folders**
- **Never add comments unless logic is truly complex**
- **Never use client-side data fetching with `useEffect`**
- **Never hardcode provider logic or magic strings**

### ✅ ALWAYS DO

- **Always use functional programming patterns**
- **Always prefer `type` over `interface` unless polymorphism is needed**
- **Always use kebab-case for filenames**
- **Always abstract database access through repositories**
- **Always use server actions for data operations**
- **Always implement proper error handling**

## 🔧 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (relaxed strict mode: `strict: false`)
- **Styling**: Tailwind CSS v4
- **Database**: Drizzle ORM (abstracted through repositories)
- **State**: Zustand
- **Validation**: Zod
- **UI**: Radix/Shadcn components (but prefer custom solutions)
- **Authentication**: Custom JWT implementation with functional repositories

## 📝 Development Workflow

### Creating New Features

1. Create module in `src/modules/{feature-name}/`
2. Set up functional repository in `repositories/`
3. Create queries/mutations as needed
4. Add validation schemas in `models/`
5. Create UI components in appropriate location
6. Wire everything together with server actions

### File Naming

- **Files**: kebab-case (e.g., `user-repository.ts`)
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions**: camelCase with descriptive names (e.g., `getUserById`)

### Import Patterns

```typescript
// ✅ Use path aliases for src imports
import { Component } from '@/components/component'
import { getUserById } from '@/modules/user/repositories/user-repository'

// ✅ Relative imports for local files
import './styles.css'
import { localHelper } from './utils'
```

## 🎨 UI/UX Guidelines

### Component Patterns

- **Server components by default** (no 'use client')
- **Client components only for interactivity**
- **Shared components in `/src/components/`**
- **Page-specific components co-located with routes**

### Styling

- Use Tailwind classes for styling
- Dark mode support via `dark:` classes
- Custom CSS variables for theming
- Responsive design with max-width containers

## ⚡ Performance Requirements

- **First Load JS**: Keep under 70kb
- **Font optimization**: Use local fonts when possible
- **Images**: Use `next/image` with proper optimization
- **Code splitting**: Implement proper boundaries
- **Memoization**: Use `React.memo()` for expensive renders

## 🔐 Security Guidelines

- Never expose API keys or secrets
- Validate all inputs with Zod schemas
- Use server-side operations for sensitive data
- Implement proper authentication checks
- Sanitize user inputs

## 📚 Content Guidelines

### Blog Posts (for this portfolio project)

- Frontmatter must include: `title`, `publishedAt`, `summary`
- Store in `src/app/blog/posts/` as MDX files
- Use proper semantic HTML structure
- Include meta descriptions for SEO

## 🚀 Deployment & Production

This project is configured for Vercel deployment with:

- Automatic builds on push
- Analytics integration
- Performance monitoring
- Edge network optimization

## 🔄 Keeping AI Configurations Updated

### Pre-commit Hook (Automatic)

A custom pre-commit hook automatically detects changes to `.ruler/` files and prompts to run `ruler apply`:

```bash
# Make changes to Ruler files
git add .ruler/AGENTS.md
git commit -m "Update AI rules"
# Hook will prompt: "Would you like to run 'ruler apply' now? (y/N)"
```

### Manual Updates

```bash
# Apply ruler manually
npm run ruler:apply

# Check status
npm run ruler:check
```

---

*These guidelines ensure consistency, performance, and maintainability. When in doubt, prioritize simplicity and developer experience.*
