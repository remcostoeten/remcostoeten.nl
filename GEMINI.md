### Export and Page Structure

*   ✗ No default exports anywhere **except** in **pages** and **views**.
*   Use **named exports only** for all modules and components (e.g., `export function foo() {}`).
*   **Pages and views** may use default exports **only** for framework components (if required).
*   **File,component and function names** Keep them minimal, usually maximum two words.
*   **Function Declarations**: Use standard function declarations (`function foo() {}`). Avoid arrow functions for top-level functions; use them only for callbacks or memoized functions.
*   **No Classes**: Avoid using classes unless required by a framework.


### Page Files Rules:
*   A page may never contain logic.
*   It may only return a `View` and optionally Metadata.

Views are the render of the page, consisting of all UI components and logic coming together.

*   The naming convention for views is `*MODULE_NAME*-view.tsx` (e.g., `login-view.tsx`, `dashboard-view.tsx`, `settings-view.tsx`).
*   Views are located in the `/views` or `src/views` directory.
*   The `views` directory never makes use of a barrel file.

---

## 5. State & Logic Management

### Framework-Specific State Management

The AI should detect and use appropriate state management patterns based on the target framework:

**React/Next.js**:
```tsx
const [count, setCount] = useState(0);
const doubledCount = useMemo(() => count * 2, [count]);
useEffect(() => {
  // side effects
}, [dependency]);
```

**SolidJS**:
```tsx
const [count, setCount] = createSignal(0);
const doubledCount = createMemo(() => count() * 2);
createEffect(() => {
  // side effects
});
```

### Complex State Management

For complex state with multiple actions, especially for persistence across routing or global accessibility, the AI should identify and leverage existing state management libraries in the project (`package.json`). The goal is to avoid excessive state hooks and ensure state is managed efficiently and scalably.

*   **Primary Strategy**: The AI **must** first check `package.json` for dedicated state management libraries (e.g., `jotai`, `zustand`, `solid-state`, `tanstack-store`, etc.). If a library is detected, the AI **must** propose and implement a solution utilizing that library, emphasizing reusable, functional patterns (e.g., atoms, slices, stores) appropriate for the chosen library.
*   **Fallback Strategy (Reducers)**: If no dedicated state management library is present, the AI **must** utilize pure reducer functions in combination with the framework's state primitives for managing complex local state.
    *   **Rule**: Keep reducer functions pure: `(state, action) => newState`.
    *   **Implementation**: Use appropriate state primitives to hold the state, and dispatch actions to a pure reducer that calculates the next state.
    *   **Guideline**: Avoid sprawling imperative code or deeply nested conditionals—prefer reducer composition and clear action types.
    *   **Guideline**: Use reducers to encapsulate complex transformations, especially for UI state or domain logic.
    *   **Guideline**: Connect reducers via the framework's reactivity system or invoke them directly in server functions or utilities.
    *   **Guideline**: Prefer reducers over multiple state hooks when state shape or transitions become complex.
    *   **Guideline**: Keep reducer logic separate from UI code — export from dedicated files.

**Reducer Example:**

```ts
type TAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number };

function counterReducer(state: number, action: TAction): number {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    case 'reset':
      return action.payload;
    default:
      return state;
  }
}

// React implementation:
// const [count, setCount] = useState(0);
// const dispatch = (action: TAction) => setCount(prev => counterReducer(prev, action));

// SolidJS implementation:
// const [count, setCount] = createSignal(0);
// const dispatch = (action: TAction) => setCount(prev => counterReducer(prev, action));
```

---

## 6. Data Layer & Error Handling

### Functional Factories for Database

Use a standardized functional factory pattern for all Drizzle ORM operations to ensure consistency and reusability. Factories handle only DB access; business logic stays separate.

*   **Rule**: Use only named async functions inside factories; no arrow constants.
*   **Rule**: Factories must be pure functions returning an object with named CRUD async functions: `create`, `read`, `update`, `delete`.
*   **Rule**: Factories accept Drizzle ORM `db` instance as a parameter.
*   **Guideline**: Avoid duplicating CRUD logic; reuse factories across server actions/functions.
*   **Guideline**: Factories handle only DB access and mapping; business logic stays outside.
*   **Guideline**: Use strong TypeScript generics for input/output types.
*   **Guideline**: Factories must return full entities after create or update.
*   **Rule**: Export factory functions and server actions as named exports only.
*   **Rule**: No default exports for factory or server action functions.
*   **Rule**: No raw SQL or string interpolations inside factories; use Drizzle ORM query builder.

### Base Types for Entities

*   **Rule**: If a file only contains a single type or interface and it's not exported name MUST be TProps for convention..
*   **Rule**: Define extensible `TTimestamps` type for `createdAt` and `updatedAt` as `Date` or compatible.
*   **Rule**: Define generic base entity type `TBaseEntity` with:
    *   `id: number`
    *   timestamps via `TTimestamps`
*   **Rule**: Entity-specific types extend from `TBaseEntity` by intersection or extension.
*   **Rule**: Use only `type` aliases (never `interface`).
*   **Rule**: Prefix all types with capital `T` (e.g., `TProps`, `TTimestamps`).

### Error Handling Strategy

Functions that can fail (e.g., API calls, DB queries) **must not throw**. They must return a `TResult` object to make success and failure explicit.

**TResult Type:**

```ts
type TSuccess<T> = { ok: true; value: T };
type TFailure<E> = { ok: false; error: E };
type TResult<T, E> = TSuccess<T> | TFailure<E>;
```

**Factory Example with Error Handling:**

```ts

function createUserFactory(dbInstance: typeof db) {
  async function findById(id: number): Promise<TResult<TUser, string>> {
    try {
      const user = await dbInstance.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id)
      });
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      return { ok: true, value: user };
    } catch (e) {
      console.error(e);
      return { ok: false, error: 'Database query failed' };
    }
  }

  return { findById };
}

```

---

## 7. Development Tooling & Environment

### Package Manager

A strict policy on package managers ensures a consistent and fast development environment.

*   **Primary Manager**: Always use **bun** for all dependency management and script execution (`bun install`, `bun run dev`).
*   **Fallback Manager**: If bun fails for any reason, the designated fallback is **pnpm**.
*   **Forbidden Managers**: Do **not** use `npm` or `yarn`.

---

## 8. AI Collaboration & Workflow

These rules govern how I, the AI assistant, will approach tasks to ensure a predictable and iterative workflow.

*   **Framework Detection**: I will first identify the target framework from `package.json` and adapt all patterns accordingly.
*   **Focus & Completion**: I will finish the current task, scope, or feature **completely** as requested. I **will not get sidetracked** or start implementing tangential or hypothetical features.
*   **No Mock Implementations**: I will provide only concrete, functional code. I **will not** include placeholder or mock implementations unless explicitly requested for scaffolding purposes.
*   **Task Granularity**: All work will be broken down into the smallest possible, isolated tasks. This allows for incremental development and reduces the risk of incomplete features.
*   **Large Task Planning**:
    *   If a task is too large for a single step, I will first create a detailed plan.
    *   The plan will be a markdown file with sections and checkboxes, located in a `tmp/` directory (which should be added to `.gitignore`).
*   **Iterative Review Process**:
    *   After completing **each section** from the plan file, I will **STOP** the process entirely.
    *   I will then prompt you to review the completed work.
    *   You should commit and push the changes before instructing me to continue to the next section. This ensures continuous integration and avoids half-finished work accumulating.

---

## 9. Styling

*   **Methodology**: Use **Tailwind CSS** for all styling.
*   **No Custom CSS**: Do not write custom `.css` files for components. Global styles or theme variables in `src/shared/styles/` are the only exception.
*   **Class Sorting**: Use the official Tailwind CSS Prettier plugin to automatically sort classes.
*   **Dynamic Classes**: Use a library like `clsx` or `cn` to conditionally apply classes cleanly.
*   **UI Components**: Common UI components can be imported like: `import { Card, Button, Tooltip, TooltipProvider } from 'ui'`. Note that the use of Shadcn UI is not mandatory across the entire project; custom UI components when located at a logical place are ok. Notice the import from 'ui'. We have a tsconfig alias ui pointing towards the barrel file of that folder.

---

## 10. Testing Policy

*   **No Tests by Default**: We do not write tests unless explicitly requested.
*   **Discuss First**: If you believe tests are necessary, discuss the rationale first and proceed only upon confirmation.
*   **Framework Agnosticism**: When tests are written, they should be agnostic to the specific framework implementation details where possible.