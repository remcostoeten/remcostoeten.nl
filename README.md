# remcostoeten.nl

Next.js personal site with marketing pages, MDX blog, admin panel, and activity sync (GitHub/Spotify).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Drizzle ORM · Neon Postgres · better-auth

## Setup

```bash
bun install
cp .env.example .env.local
```

Required in `.env.local`:
```
DATABASE_URL=
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=
```

```bash
bun drizzle-kit push
bun run dev
```

## Env Vars

- `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` — required
- `GITHUB_CLIENT_ID/SECRET`, `GITHUB_TOKEN` — GitHub OAuth + API
- `GOOGLE_CLIENT_ID/SECRET` — Google OAuth
- `SPOTIFY_*` — Spotify integration
- `POSTHOG_API_KEY` — PostHog analytics
- `CRON_SECRET` — Sync endpoints

## Analytics

Admin panel has analytics config. Set `POSTHOG_API_KEY` and `POSTHOG_HOST` for PostHog. Vercel Analytics works automatically on Vercel.

## Run

```bash
bun run dev      # dev
bun run check    # lint + typecheck + test
bun run build    # release
```
