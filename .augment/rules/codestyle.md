---
type: "always_apply"
---

# Practical Functional Programming with SolidJS and TypeScript

This document outlines the coding style and architectural principles for writing predictable, functional-style code in our modern TypeScript and SolidJS applications.

## Core Principles

### Functional Purity
- Functions must be **pure**: The same input always yields the same output, and they produce no side effects outside their scope.

### Immutability
- Favor **immutability**: Never mutate function arguments or external state. Use immutable data patterns (e.g., spreading objects/arrays for updates).

### Composition
- Favor **composition** over inheritance: Build functionality from small, reusable, and self-contained parts.

### Declarative Style
- Code should be **declarative** when it improves clarity, expressing *what* to do rather than *how* to do it.

### SolidJS Specific: Granular Reactivity
- Embrace SolidJS's **fine-grained reactivity**: Use signals (`createSignal`), memos (`createMemo`), and effects (`createEffect`) for reactive state and computations. Avoid manual DOM manipulation.

### Modularity and Colocation
- Organize code in a **modular and colocated** manner. Logic, components, and types related to a specific feature should reside together in a dedicated directory (e.g., `src/features/auth/`). This promotes discoverability and maintainability.

## Allowed and Disallowed Constructs

### ✅ Allowed
- Use `function` declarations only: `function doSomething() {}`.
- `for`, `for...of`, and `while` loops are allowed **if the logic is pure**.
- Prefer `map`, `filter`, `reduce`, etc., when they improve clarity.
- Use named functions exclusively—no anonymous functions.
- Use immutable data patterns (e.g., spreading objects/arrays).
- **SolidJS Specific**: Use SolidJS primitives like `createSignal`, `createMemo`, `createEffect`, `createResource`, etc.
- **SolidJS Specific**: Utilize SolidJS control flow components like `<For />`, `<Show />`, `<Suspense />`, `<ErrorBoundary />` for rendering lists, conditional content, and managing async states.
- Components should generally be pure functions that only render UI based on their props and reactive state.

### 🚫 Not Allowed
- ❌ No `class`, `extends`, `new`, or `this`.
- ❌ No arrow function constants: `const x = () => {}`—use `function x() {}`.
- ❌ No shared mutable state **outside of Solid's reactivity system (signals)**.
- ❌ No side effects outside function scope (unless explicitly managed by `createEffect` for reactive side effects, or a dedicated data fetching mechanism).
- ❌ **SolidJS Specific**: No direct DOM manipulation outside of Solid's rendering lifecycle.

## Code Comments

Code must be self-explanatory and readable without comments.

### 🚫 Not Allowed
- ❌ No inline comments (e.g., `// filter out inactive users`).
- ❌ No block comments (e.g., `/* function to get emails */`).
- ❌ No explanatory comments above functions or variables.

### ✅ Allowed
- ✅ Only comment if absolutely necessary to clarify non-standard or obscure syntax (e.g., bitwise hacks, regex edge cases).
- ✅ Use clear, descriptive function and variable names instead of comments.

📌 If you feel the need to comment, rewrite the code for clarity instead.

## Component Props Typing — Mandatory `TProps` for Single Type Files

When defining a SolidJS component with props, if the file contains **only one non-exported type**, it **MUST** be named exactly `TProps`.

**Example:**
For this component:

```tsx
function Button(props) {
  // ...
}
```

You MUST define props like this:
```tsx
type TProps = {
  name: string;
  onClick?: () => void;
  another?: any;
};

export function Button(props: TProps) { // In Solid, props are typically a single object
  const { name, onClick, another } = props;
  // ...
}
```
**Key points:**

- `TProps` is always used if there’s only one type in the file.
- `TProps` must not be exported—it is local to the component file.
- Props must be explicitly typed—never leave props untyped or inline-typed.
- Follow camelCase naming for properties inside `TProps`, but the type name itself must be `TProps`.

This ensures consistent, clear, and easy-to-find component prop typings across the codebase.

## Use Types Only, No Interfaces

- Use **`type`** declarations exclusively—do **not** use `interface`.
- All type names **must** be prefixed with `T`.
  Example: `type TUser = { ... }`.
- If a file contains exactly **one non-exported type**, name it `TProps` by default.
  - This usually applies to component or function props types.
  - Example:
    ```ts
    type TProps = {
      title: string;
      onClick: () => void;
    };
    ```
- Exported types must use descriptive names with the `T` prefix.

## Export and File Structure

- ❌ No default exports anywhere **except** for **root layout components (if applicable in your Solid setup)**.
- Use **named exports only** for all modules and components (e.g., `export function foo() {}`).

### Modular/Colocated Feature Structure:
- Features should be organized in dedicated directories, typically under `src/features/`.
- Each feature directory encapsulates all related components, hooks, types, utilities, and even local stores for that feature.
- Example structure:
```
src/
└── app/
    ├── routes.tsx
    ├── layout.tsx
    └── providers.tsx
└── entities/
    ├── user.ts
    └── auth.ts
└── features/
    ├── auth/
    │   ├── components/
    │   │   ├── login-form.tsx
    │   │   └── signup-form.tsx
    │   ├── hooks/
    │   │   └── use-auth.ts
    │   ├── api/
    │   │   ├── login.ts
    │   │   └── signup.ts
    │   ├── store/
    │   │   └── auth-store.ts
    │   ├── types.ts
    │   └── index.ts
    └── user-profile/
        ├── components/
        │   └── user-card.tsx
        ├── hooks/
        │   └── use-user-profile.ts
        ├── api/
        │   └── user-profile-api.ts
        ├── store/
        │   └── user-profile-store.ts
        ├── types.ts
        └── index.ts
└── shared/
    ├── components/
    │   ├── button.tsx
    │   └── modal.tsx
    ├── hooks/
    │   └── use-media-query.ts
    ├── utils/
    │   └── format-user.ts
    └── styles/
        └── theme.css
└── services/
    ├── http.ts
    ├── auth-service.ts
    └── logger.ts
└── lib/
    └── formatters.ts
└── index.tsx
└── vite.config.ts
```


- **Barrel files (`index.ts`) are forbidden** within feature subdirectories (e.g., `features/auth/components/index.ts`) and main directories (e.g., `features/index.ts`, `views/index.ts`). Explicit imports improve traceability.

## Use Reducers for Complex or Stateful Logic

- For complex state management or business logic with multiple steps or actions, **use pure reducer functions** (`(state, action) => newState`).
- Avoid sprawling imperative code or deeply nested conditionals—prefer reducer composition and clear action types.
- Reducers must be **pure functions** without side effects.
- Define action types explicitly (e.g., as union string literals or enums).
- Use reducers to encapsulate complex transformations, especially for UI state or domain logic.
- **SolidJS Specific**: Implement reducer-like patterns using `createSignal` or `createStore` and a separate pure reducer function. Solid's `createReducer` primitive or custom implementations are suitable.
- Prefer reducers over multiple `createSignal` calls when state shape or transitions become complex.
- Keep reducer logic separate from UI code—export from dedicated files (e.g., `feature-name/store.ts`).

**Example:**

```ts
type TAction =
| { type: 'increment' }
| { type: 'decrement' }
| { type: 'reset'; payload: number };

function counterReducer(state: number, action: TAction): number {
switch(action.type) {
  case 'increment': return state + 1;
  case 'decrement': return state - 1;
  case 'reset': return action.payload;
  default: return state;
}
}

// Example usage in a Solid component (not part of the rule itself, but for context)
// import { createSignal } from 'solid-js';
// const [count, setCount] = createSignal(0);
// const dispatch = (action: TAction) => setCount(prev => counterReducer(prev, action));
```

## Use Factory Functions and Functional Abstractions

### Functional Factories & Base Types for SolidJS + Drizzle ORM (PostgreSQL)

#### 1. Functional Factories
- Use only named `async function` declarations inside factories; no arrow function constants.
- Factories must be pure functions returning an object with named CRUD `async function`s: `create`, `read`, `update`, `destroy`.
- Factories accept Drizzle ORM schema/table as a parameter, typed generically.
- Avoid duplicating CRUD logic; reuse factories across server actions/utility functions.
- Factories handle only DB access and mapping; business logic stays outside.
- Use strong TypeScript generics for input/output types.
- Factories must return full entities after create or update.
- Export factory functions and related utility functions as named exports only.
- No default exports for factory or related utility functions.
- No raw SQL or string interpolations inside factories; use Drizzle ORM query builder.
- **Drizzle ORM Specific**: Always use Drizzle ORM's robust query builder. Avoid writing raw SQL or string-interpolated queries directly unless absolutely necessary and justified (e.g., for highly complex, optimized queries, which should still be encapsulated).
- **Drizzle ORM Specific**: Ensure proper transaction management for multi-step database operations.

#### 2. Base Types
- Define extensible `TTimestamps` type for `createdAt` and `updatedAt` as `Date` or compatible type.
- Define generic base entity type `TBaseEntity` with:
- `id: number`
- timestamps via `TTimestamps`
- Entity-specific types extend from `TBaseEntity` by intersection or extension.
- Use only `type` aliases (never interfaces).
- Prefix all types with capital `T` (e.g., `TProps`, `TTimestamps`).
- For single type per file not exported, use `TProps` by default.

#### 3. General Code Style
- No classes.
- No arrow function constants anywhere.
- Use named async functions only.
- No default exports except for root layout components (if applicable).
- Keep business logic outside factories.
- Use clear, descriptive type names.

## File Naming Convention

- All file names **must** use `kebab-case`.
Example: `user-profile.tsx`, `data-utils.ts`.

## No Testing Needed Except If Requested

For normal code, we never write tests unless explicitly requested. If there's a perceived need for tests, discuss the rationale first and only proceed with implementation if confirmed.
