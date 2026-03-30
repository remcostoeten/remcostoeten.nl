# Architecture Checklist

Use this as the release gate for calling the codebase "done" from an architecture perspective.

## Status

- `[x]` Completed
- `[ ]` Still open

## Core Boundaries

- `[x]` Server-only code is grouped under `src/server` or clearly server-owned feature folders.
- `[x]` Top-level `src/actions` has been removed in favor of `src/server/actions`.
- `[x]` Server actions are grouped by domain under `src/server/actions`.
- `[x]` Request/security helpers are no longer in a vague catch-all `lib` bucket.
- `[x]` GitHub server concerns are grouped under `src/server/github`.
- `[x]` Spotify server concerns are grouped under a dedicated `src/server/spotify` domain.

## Route Shape

- `[x]` The combined activity route is a thin handler instead of a monolithic route file.
- `[x]` Large `activity-sync` logic has been split into focused modules.
- `[x]` The combined activity route no longer owns meaningful provider logic inline.
- `[ ]` API routes consistently act as thin adapters only across the repo, with no meaningful integration duplication left.

## Actions

- `[x]` Contact actions are split into focused modules for validation, context, submission, tracking, and analytics.
- `[ ]` Blog comments actions are split further if needed so auth, persistence, and admin-specific concerns are easier to scan.
- `[ ]` Blog reactions actions are split further if needed so session, visitor identity, and persistence are more clearly separated.
- `[ ]` Admin actions are reviewed for possible separation of metrics queries vs mutation logic.

## Integration Domains

- `[x]` GitHub logic used by `src/app/api/activity/combined` is consolidated with `src/server/github` so parsing and fetch behavior have one source of truth.
- `[x]` Spotify server-side fetch/fallback logic used by `src/app/api/activity/combined` is consolidated into a server domain instead of staying route-local.
- `[x]` Client-side Spotify fetch helpers are no longer stored under `src/server/services`.

## Database Layer

- `[x]` Schemas are split into domain files and barrel-exported through `src/server/db/schema.ts`.
- `[x]` Shared schema helpers are centralized in `src/server/db/helpers.ts`.
- `[x]` Database imports are normalized to one pattern in the current app/server surface.
- `[ ]` Stale schema fields, helpers, or toggles are reviewed and removed where no longer needed.

## Naming And Structure

- `[x]` Folder names now reflect ownership more clearly than before.
- `[ ]` Remaining generic names like `services` are reviewed and either tightened or renamed if they become catch-all buckets.
- `[ ]` Similar concepts use one naming convention across the repo.
- `[ ]` Import paths are normalized consistently across server modules.

## Runtime Safety

- `[x]` `lint` passes.
- `[x]` `typecheck` passes.
- `[x]` `build` passes.
- `[x]` Invalid `'use server'` barrel re-export patterns introduced during refactor have been removed.
- `[ ]` Manual smoke testing is completed for the key flows listed below.

## Environment And External Dependencies

- `[ ]` Legacy `NEXT_PUBLIC_GITHUB_TOKEN` usage on the server is removed and replaced with `GITHUB_TOKEN`.
- `[ ]` The GitHub token is rotated after removing the public-prefixed fallback.
- `[ ]` Build-time GitHub rate limiting is reduced or handled more intentionally where possible.
- `[x]` Environment access is centralized through `src/server/env.ts` for the main server configuration path.

## Dead Code And Cleanup

- `[x]` Removed-path imports from old `src/actions` and old server helper locations are gone.
- `[x]` Invalid compatibility barrels added during refactor are gone.
- `[ ]` Remaining dead helpers, stale comments, and one-off compatibility code are audited manually.
- `[ ]` Unused files and exports are reviewed with a final cleanup pass.

## Documentation

- `[x]` README is updated to reflect the current architecture and folder boundaries.
- `[x]` Setup docs mention the correct server env vars and no longer imply public-prefixed server tokens.
- `[x]` A short architecture section explains the purpose of `src/server/actions`, `src/server/github`, `src/server/request`, `src/server/security`, and `src/server/db`.

## Manual Smoke Test

- `[ ]` Contact form submission works.
- `[ ]` Contact tracking still records interactions and abandonments correctly.
- `[ ]` Blog comments flow works.
- `[ ]` Blog reactions flow works.
- `[ ]` Admin pages render and protected access still works.
- `[ ]` Project list renders correctly.
- `[ ]` Combined activity endpoint returns expected data.
- `[ ]` Sync route still works for status and manual/admin trigger flows.

## Practical Done Definition

Call the architecture pass done when all of these are true:

- All items under `Core Boundaries`, `Route Shape`, `Runtime Safety`, and `Dead Code And Cleanup` are complete.
- The GitHub and Spotify integration duplication items are complete.
- The legacy GitHub token env issue is fixed.
- The manual smoke test list is complete.
- README/setup docs reflect the current structure.
