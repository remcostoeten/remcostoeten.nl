# Functional Repository Pattern & Server Architecture

## Project Structure Rules

Use a clear domain-driven folder structure:

- `src/modules/`: Contains all feature-specific code, organized by feature name.
    - `src/modules/authenticatie/`: All authentication logic.
        - `src/modules/authenticatie/queries/`: Authentication-specific query functions.
        - `src/modules/authenticatie/mutations/`: Authentication-specific mutation functions.
        - `src/modules/authenticatie/repositories/`: Authentication-specific functional repositories.
- `src/shared/`: Contains any shared logic, components, hooks, or utilities used across the application.
    - `src/shared/components/ui/`: Shared components like those from Shadcn.
    - `src/shared/state/`: Any shared application state.
    - `src/shared/types/`: Generic shared types.
    - `src/shared/repositories/`: Base or shared functional repository implementations.
- `src/components/`: Holds singular-use components (e.g., header, footer).
- `src/app/`: Used exclusively for rendering views. Each page consists of a `page.tsx` and associated metadata.
    - **Views:** The page content is imported from `src/views/<page-name>/index.tsx`. Views only handle rendering and importing components—no logic is present here.
- `src/views/`: Contains the UI composition for specific pages, composed of UI blocks.
- `src/api/`: Server-side logic and API endpoints.
    - `src/api/db/`: Database layer and schemas.
        - `src/api/db/index.ts`: Database connection.
        - `src/api/db/schemas/`: Drizzle schemas.
        - `src/api/db/schemas/index.ts`: Main schema exports.
    - `src/api/env.ts`: t3 env setup.
- `src/schema/`: Drizzle schemas only (can be used for partial schemas within modules).
- `src/hooks/`: Custom React hooks (auth state, effects).

## Architecture Patterns

### ✅ Patterns to Follow

- **ONLY** use `function foo() {}` syntax - NEVER arrow functions for regular operations
- **ONLY** use arrow `const` syntax when memoizing or creating callbacks
- Define all logic in functions, not classes (NO CLASSES ALLOWED).
- Implement the Repository Pattern using functional constructs. All database queries and mutations should be handled within dedicated functional repositories.
- Functional repositories should abstract the underlying data source (e.g., Drizzle ORM) from the application logic.
- **ONLY** use `type` definitions - NEVER `interface` under any circumstances
- Props variable **MUST** be named `props` if only one type exists in file
- Props types must be one or two words maximum and self-explanatory
- Use server actions that directly call repository functions for data access (no separate actions folder).
- Always use email as the unique user identity key.
- Immediately create a session and set cookies after authentication. This logic will reside in a mutation function.
- Use conditional UI rendering to redirect away from login/register if authenticated.
- Use `mapUser()` per provider for adaptable OAuth payloads.
- Store authenticated state in a shared state or hook so the UI updates instantly.
- Place provider configurations in a single `PROVIDERS` object for scalability.
- Abstract database access under an alias `db` (e.g., `import { db } from 'db'`).
- Abstract database code for easy swapping of ORMs.
- Implement all server logic as **server functions** within `queries` and `mutations` folders, co-located with their respective modules. These server functions will interact with the functional repositories.
- Ensure everything built is agnostic to the underlying libraries and frameworks (e.g., database and authentication logic should be easily swappable). The functional Repository Pattern facilitates this.
- Avoid framework/library-specific naming (e.g., no `supabase.ts` or `prisma.ts`).
- Design features to be portable across projects with minimal changes.
- Emphasize shared components and hooks for consistency.

### ❌ Anti-patterns to Avoid

- **NEVER** use arrow functions for regular operations: `const foo = () => {}` is FORBIDDEN
- **NEVER** use classes under any circumstances
- **NEVER** use `interface` - only `type` definitions allowed
- **NEVER** name props anything other than `props` for single-type files
- Don't use `getServerSideProps`, `useEffect` for data fetching. Interact with data through functional repositories in server actions (`queries` or `mutations`) or other server-side contexts.
- Don't call JWT functions on the client.
- Don't hardcode provider logic outside the `PROVIDERS` map.
- Don't use magic strings for role checks (e.g., use `isAdmin`).
- Don't bundle large libraries in the initial JS payload.
- Don't load non-critical fonts eagerly.
- Don't use client-side navigation for critical paths.
- Don't implement heavy computations without memoization.
- Don't load full libraries when only parts are needed.
- **NEVER** add comments unless absolutely necessary, then use `@name`/`@description` format only
- **NEVER** create documentation files (.mdx, .md, .txt) after completing features
- **Don't directly access the database (using `db`) outside of functional repository implementations.**
- Do not create a `lib` folder, or `helpers` or `utilities` folders. Place shared functional code within the `src/shared` directory.

## Server Architecture Pattern

### Database Layer Structure

All server operations must follow this layered architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Hooks     │    │    Actions      │    │  Mutations      │    │   Database      │
│  (Client-side)  │◄──►│ (Server Actions)│◄──►│  (DB Operations)│◄──►│  (Drizzle ORM)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### File Structure

#### 1. Mutations Layer (`/modules/{feature}/server/mutations/`)

- **Purpose**: Pure database operations using Drizzle ORM
- **Files**: Individual mutation files for specific operations
- **Pattern**:

    ```typescript
    'use server'

    import { db } from '@/server/db'
    import { tableName } from '@/server/schema'

    export async function mutationName(params) {
        // Pure database operation
        return await db.operation()
    }
    ```

#### 2. Actions Layer (`/modules/{feature}/server/actions/`)

- **Purpose**: Server actions that orchestrate mutations and handle business logic
- **Pattern**:

    ```typescript
    'use server'

    import { mutationName } from '../mutations'

    export async function actionName(params) {
        try {
            // Use mutations for DB operations
            const result = await mutationName(params)

            // Handle business logic, validation, caching, etc.
            revalidatePath('/some-path')

            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
    ```

#### 3. API Hooks Layer (`/modules/{feature}/hooks/`)

- **Purpose**: Client-side hooks that call server actions
- **Pattern**:

    ```typescript
    'use client'

    import { useMutation } from '@/hooks/use-api'
    import { actionName } from '../server/actions'

    export function useFeatureAction() {
        return useMutation({
            mutationFn: async params => {
                const result = await actionName(params)
                if (!result.success) {
                    throw new Error(result.error)
                }
                return result
            }
        })
    }
    ```

## Server Architecture Rules

1. **No Direct DB Access in Actions**: Actions must use mutations, never direct database calls
2. **No Direct Action Calls in Components**: Components must use API hooks
3. **Single Responsibility**: Each file should have one clear purpose
4. **Type Safety**: Maintain strong typing across all layers
5. **Error Handling**: Proper error handling at each layer

## OAuth Guidelines

- All OAuth callback URIs should resolve to: `http://localhost:3000?provider=xyz`
- Provider tokens should always be exchanged server-side.
- Extract email fallback from providers that don't send it directly.

## Authentication Logic

- A user is considered admin if their email matches `process.env.ADMIN_EMAIL`.
- The session is created server-side via a mutation function that interacts with an authentication repository.
- Session must persist across page reloads and logouts must be handled via a mutation (not a route), which will interact with the authentication repository.
- We are building a custom-rolled authentication with JWT (using Jose), sessions, and an ORM, encapsulated within functional authentication repositories.

## Naming Conventions

1.  **File Names:**
    - Use **kebab-case** for all filenames.
    - Single-function files: One file per function (e.g., `get-user.ts`).
    - Each folder has an `index.ts` for exports.
2.  **Imports:**
    - Use aliases for clarity and simplicity (e.g., `ui`, `db`). Note that `db` will primarily be used within functional repository implementations.
3.  **Components:**
    - Components are named in PascalCase.
4.  **Types:**
    - Prefer **types** over interfaces where possible.
    - Generic types (e.g., `PageProps`) are stored in `src/shared/types/`.
5.  **Repositories:**
    - Functional repository files should follow the kebab-case convention (e.g., `user-repository.ts`).
    - Repository functions within these files should be clearly named to indicate their purpose (e.g., `getUserById`, `createUser`).

## Technology Stack

- Zustand (state management)
- Framer Motion (animations)
- Radix/Shadcn (UI components, though custom-built solutions are preferred)
- TailwindCSS (styling)
- Zod (validation)
- Drizzle ORM / Drizzle-Kit (default ORM, but swappable)
- Postgres (database, though interchangeable with equivalent solutions)
- Jose (JWT handling)
- Prism or another syntax highlighter (if needed)
- Icon library of choice
- Nuqs (if needed)
