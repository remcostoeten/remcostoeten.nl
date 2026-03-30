# Testing And Release Gate Roadmap

## Objective

Add a high-signal test setup using Vitest and make it part of the release gate without filling the repo with brittle or low-value tests.

This plan is intentionally biased toward:

- integration-heavy tests for logic we own
- boundary mocks for third-party APIs
- small test count with high regression value
- readable local and CI output

## Non-Goals

Do not spend time testing:

- Spotify API behavior
- GitHub API behavior
- Next.js internals
- Framer Motion behavior
- Tailwind class details
- snapshot-heavy component output
- trivial wrappers with no branching or transformation

## Immediate Blockers Before Test Rollout

These need to be fixed first because the build is currently not green:

1. Broken Spotify auth imports
   - `src/app/api/spotify/now-playing/route.ts`
   - `src/app/api/spotify/recent/route.ts`
   - `src/server/spotify/tracks.ts`
   - `src/server/services/activity-sync/spotify-sync.ts`

2. Decide and lock the Spotify fallback contract
   - preferred behavior: return stored listens from Postgres when live Spotify playback endpoints fail
   - avoid hardcoded fake tracks in production-facing paths

## Phase 1: Tooling Setup

### Files To Add

- `vitest.config.ts`
- `src/test/setup.ts`
- `src/test/factories/spotify.ts`
- `src/test/factories/github.ts`
- `src/test/factories/blog.ts`
- `src/test/utils/env.ts`
- `src/test/utils/fetch.ts`
- `src/test/utils/time.ts`

### package.json changes

Add scripts:

- `test`
- `test:watch`
- `test:coverage`
- `check`
- `prebuild`

Recommended shape:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "check": "npm run lint && npm run typecheck && npm run test",
    "prebuild": "npm run check"
  }
}
```

### Vitest defaults

- default environment: `node`
- only use `jsdom` for the few client tests that genuinely need DOM APIs
- path alias support for `@/`
- setup file loaded globally
- no coverage threshold in the first pass

## Phase 2: Release Gate

### Local Release Gate

Required order:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`

### CI Gate

Create one workflow that runs on:

- pull requests
- pushes to `master`

### CI workflow file

- `.github/workflows/ci.yml`

### CI job steps

1. checkout
2. install dependencies
3. restore dependency cache
4. run lint
5. run typecheck
6. run vitest
7. run build

Notes:

- tests must not depend on live Spotify or GitHub credentials
- tests must not make network calls
- failures should stop deploy/merge

## Phase 3: High-Value Test Targets

Start with these modules only.

### 1. Combined Activity Composition

Target:

- `src/app/api/activity/combined/combine.ts`

Test file:

- `src/app/api/activity/combined/combine.test.ts`

What to test:

- merges current and previous year contributions into one map
- sums total contributions correctly
- preserves recent activity from the GitHub layer
- includes Spotify tracks when available
- returns partial data safely when Spotify tracks are empty

Mock boundaries:

- `@/server/github`
- `@/server/spotify`

Why it matters:

- powers the public homepage
- easy to break during refactors

### 2. Spotify Track Fallback Logic

Targets:

- `src/server/spotify/tracks.ts`
- whichever module becomes the canonical Spotify auth helper after import cleanup

Test files:

- `src/server/spotify/tracks.test.ts`
- auth helper test if it keeps branching logic worth protecting

What to test:

- no credentials -> fallback to stored DB tracks
- token retrieval failure -> fallback to stored DB tracks
- upstream Spotify non-OK -> fallback to stored DB tracks
- successful recent-track response is normalized correctly
- empty upstream recent-track response falls back to stored tracks

Mock boundaries:

- `fetch`
- DB query layer
- auth helper

Why it matters:

- directly affects public release quality
- this is where graceful degradation should live

### 3. Spotify API Route Behavior

Targets:

- `src/app/api/spotify/recent/route.ts`
- `src/app/api/spotify/now-playing/route.ts`
- `src/app/api/spotify/auth-url/route.ts`
- `src/app/api/spotify/callback/route.ts`
- `src/app/api/spotify/dev-token/route.ts`

Test files:

- `src/app/api/spotify/recent/route.test.ts`
- `src/app/api/spotify/now-playing/route.test.ts`
- `src/app/api/spotify/auth-url/route.test.ts`
- `src/app/api/spotify/callback/route.test.ts`
- `src/app/api/spotify/dev-token/route.test.ts`

What to test:

- `auth-url` includes required scopes
- `auth-url` uses configured redirect URI
- callback error and missing-code branches redirect correctly
- callback success branch redirects to configured app origin
- callback success branch sets dev token cookies
- `dev-token` reads then clears cookies
- `recent` retries once on 401 if that behavior remains
- `recent` returns fallback data instead of a bare 500 once fallback contract is implemented
- `now-playing` handles empty/live/error states intentionally

Mock boundaries:

- `fetch`
- cookies API
- env reads
- auth helper

Why it matters:

- this is the highest-risk integration area in the app right now

### 4. Blog Metadata And Visibility Rules

Targets:

- public blog metadata helpers
- post visibility/draft gating logic
- topic aggregation helpers

Likely files to inspect before writing tests:

- `src/views/marketing/blog/post.tsx`
- `src/app/(marketing)/blog/[...slug]/page.tsx`
- blog feature modules under `src/features`

Test files:

- place next to the actual helper modules after identifying the stable boundaries

What to test:

- draft posts stay hidden for public requests
- canonical URLs are derived consistently
- topic extraction/grouping is stable
- slug lookups resolve expected posts

Why it matters:

- public content correctness
- SEO-facing behavior

### 5. Access Guard Behavior

Targets:

- `src/server/security/dev-access.ts`
- relevant admin/auth guard helpers

Test files:

- `src/server/security/dev-access.test.ts`
- additional guard tests where branching exists

What to test:

- dev-only routes deny in non-development contexts
- expected allow/deny behavior for admin-only checks

Why it matters:

- access mistakes are public-release bugs, not minor regressions

### 6. Client-Side Spotify Activity Fallback

Targets:

- `src/components/landing/activity/activity-feed.tsx`
- `src/hooks/use-spotify-playback.ts`

Test files:

- `src/components/landing/activity/activity-feed.test.tsx`
- `src/hooks/use-spotify-playback.test.ts`

What to test:

- cached tracks are used when live tracks are empty
- live tracks overwrite cache
- idle/error polling backs off instead of hammering the API

Do not test:

- animation details
- exact DOM structure unless tied to behavior

Why it matters:

- visible homepage behavior
- protects the performance work already done

## Phase 4: Test Support Strategy

### Factories

Use factories instead of inline payloads.

Factories needed:

- Spotify track
- Spotify currently-playing response
- GitHub activity event
- GitHub contribution payload
- blog post metadata

### Fetch mocking

Use one shared helper for mocked `fetch` responses to keep route tests readable.

### Time control

Freeze time in tests that touch:

- contribution year boundaries
- relative timestamps
- `played_at`
- cache freshness logic

## Phase 5: Build Output / Developer Experience

The build should show a clean overview of what passed before packaging.

### First iteration

Keep it simple:

- `check` command for lint + typecheck + tests
- `prebuild` runs `check`
- `build` remains build-only

### Optional second iteration

Add a small Node script if npm output becomes too noisy:

- `scripts/check.mjs`

This script can print:

- `Lint: passed`
- `Typecheck: passed`
- `Tests: X passed, 0 failed`
- `Build: starting`

Do not build this first unless the shell output is genuinely bad.

## Recommended Execution Order

1. Fix broken Spotify import paths and get `npm run build` green
2. Add Vitest config and package scripts
3. Add shared test setup and factories
4. Add tests for `combine.ts`
5. Add tests for `src/server/spotify/tracks.ts`
6. Add tests for Spotify auth and route behavior
7. Add tests for blog visibility/metadata helpers
8. Add tests for access guards
9. Add the selective client-side activity fallback tests
10. Add CI workflow
11. Optional: add cleaner check-summary output

## Definition Of Done

The first testing rollout is done when:

- `npm run check` exists and is trusted
- `npm run build` is gated by `prebuild`
- CI runs the same checks as local release prep
- the suite has a small number of high-value tests
- no test depends on live third-party services
- Spotify fallback behavior is intentionally covered
- public homepage, blog, and access control logic have meaningful regression protection

## Success Criteria

This rollout is successful if it catches:

- broken imports from refactors
- fallback regressions in Spotify/GitHub composition
- accidental route contract changes
- broken access guard behavior
- public blog visibility/metadata regressions

It is not successful if it mainly adds:

- shallow render tests
- snapshots with no behavioral value
- framework-implementation tests
- dozens of tiny assertion files that no one trusts
