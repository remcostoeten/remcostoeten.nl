# Miscellaneous Tools

Client-side browser utilities served under `/tools`. Everything runs locally —
no backend, no network requests; persistence is `localStorage` only.

## Structure

```
src/features/miscellaneous/
  types/            TToolDefinition, categories, statuses
  constants/        tools.ts — the tool registry (single source of truth)
  hooks/            useLocalStorage, useRecentTools, useFavoriteTools
  components/       hub UI (ToolsHub, ToolCard) + ToolRenderer (lazy loader)
  find-replace/     first tool — fully self-contained
```

Routes live in `src/app/(tools)/tools/`:

- `page.tsx` — the hub (search, category filters, favorites, recents,
  coming-soon).
- `[slug]/page.tsx` — registry-driven tool pages with static params and
  per-tool metadata.
- `layout.tsx` — same chrome as the marketing layout but `max-w-5xl`, since
  tools need horizontal room.

## Adding a tool

1. Create `src/features/miscellaneous/<slug>/` with an `index.tsx` default
   export (a `'use client'` component). Keep everything for the tool inside
   its folder (`components/`, `hooks/`, `utils/`, `types.ts`, `constants.ts`).
2. Add a `TToolDefinition` entry to `constants/tools.ts` with
   `status: 'available'` (or flip an existing `coming-soon` entry).
3. Register the lazy import in `components/tool-renderer.tsx`:

```tsx
const toolComponents: Record<string, ComponentType> = {
	'my-tool': nextDynamic(() => import('../my-tool'), {
		ssr: false,
		loading: ToolSkeleton
	})
}
```

That's the entire boilerplate — routing, metadata, breadcrumbs, cards,
search keywords, favorites and recents all derive from the registry entry.

## Conventions

- Keyboard shortcuts go through `@remcostoeten/use-shortcut/react`
  (`useShortcutMap`). Pass `{ ignoreInputs: false }` only for shortcuts that
  must fire while a text field has focus.
- Toasts via `sonner`.
- Persist per-tool state under a namespaced key: `misc-tools:<slug>:v<N>`,
  with a version field and defensive parsing (see
  `find-replace/utils/storage.ts`).
- Accessibility is non-negotiable: every control reachable and operable via
  keyboard, `aria-pressed` on toggles, `aria-live` for dynamic counts, visible
  focus rings, semantic landmarks.
