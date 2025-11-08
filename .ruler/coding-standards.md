# Strict Coding Standards & Conventions

## 🚨 CRITICAL CODING RULES (NO EXCEPTIONS)

### Function Syntax
- **ONLY** use `function foo() {}` syntax for regular functions
- **NEVER** use arrow functions for regular functions: `const foo = () => {}` is FORBIDDEN
- **ONLY** use arrow `const` syntax when memoizing or creating callbacks
- **NEVER** use classes - functional programming only

### TypeScript Types
- **ONLY** use `type` definitions - **NEVER** use `interface`
- Props types must be one or two words maximum
- Props types must be self-explanatory (no comments needed due to clarity)

### Props Naming Convention
- If there's only one type in a file, the props variable **MUST** be named `props`
- No other names allowed for single-type props
- Props type constants must be self-explanatory and maximum 2 words

### Comments Pattern
- If comments are absolutely necessary, use this exact format:
```typescript
/**
 * @name some name
 * @description some description
 */
```
- No other comment formats allowed
- Prefer self-explanatory code over comments

### File Organization
- **ONLY** kebab-case filenames (e.g., `user-profile.tsx`, `get-user-data.ts`)
- Co-locate inside modules or features
- Strong separation of concerns
- Files used more than ONCE go in `src/shared/`
- Example: shadcn components go in `src/shared/ui/`

### Import Patterns
- Shadcn components imported from index.ts barrel file aliased to 'ui'
  ```typescript
  import { Button } from 'ui'
  ```
- `cn` utility is at `src/shared/utilities/cn.ts` with barrel file aliased to 'utilities'
  ```typescript
  import { cn } from 'utilities'
  ```

### Performance & SEO Requirements
- This is a personal portfolio/blog for promotion - **MAXIMUM SEO is critical**
- Use SSR as much as possible
- Make only the tiny bit client-side what is absolutely needed
- Squeeze every bit of SEO performance possible

### Abstraction Patterns
- For frequently used operations, create abstraction patterns
- Must be fully functional (no classes, no arrow constants unless memoizing)
- Abstract common operations into reusable functional utilities

### 🚫 ANTI-PATTERNS (ABSOLUTELY FORBIDDEN)
```typescript
// ❌ NEVER DO THIS
const getUserData = async () => { ... }  // Arrow function for regular operation
class UserService { ... }                 // Classes
interface UserData { ... }               // Interfaces
const userProfileProps = { ... }          // Props named something other than 'props'
// lib/utils.ts                           // Old location - use src/shared/utilities/
```

### ✅ REQUIRED PATTERNS
```typescript
// ✅ ALWAYS DO THIS
async function getUserData() { ... }      // Regular function syntax

type UserProfile = {                     // Type only, max 2 words
  name: string
  email: string
}

function UserProfileComponent(props: UserProfile) {  // Props named 'props' only
  return <div>{props.name}</div>
}

// For memoization (only valid arrow const use)
const MemoizedComponent = React.memo(function UserProfileComponent(props: UserProfile) {
  return <div>{props.name}</div>
})

// Imports
import { Button } from 'ui'              // Shadcn from 'ui' alias
import { cn } from 'utilities'           // Utility from 'utilities' alias
```

## 📁 SHARED CODE STRUCTURE

```
src/shared/
├── components/ui/           # Shadcn and shared UI components
│   └── index.ts            # Barrel file aliased to 'ui'
├── utilities/              # Utility functions
│   ├── cn.ts              # Class names utility
│   └── index.ts           # Barrel file aliased to 'utilities'
├── types/                 # Shared TypeScript types
└── hooks/                 # Custom React hooks
```

## 🎯 SEO-FIRST DEVELOPMENT

- Every component decision must consider SEO impact
- Server-render everything possible
- Client-side only for unavoidable interactions
- Optimize for Core Web Vitals
- Proper semantic HTML structure
- Meta tags and structured data

## 🚫 POST-DEVELOPMENT DOCUMENTATION

**NEVER** create documentation files after completing features:
- No `.mdx` documentation files
- No `.txt` documentation files
- No `.md` documentation files
- Code should be self-documenting through clear naming and structure

If explanation is needed, the code structure is wrong - fix the code instead of documenting it.
