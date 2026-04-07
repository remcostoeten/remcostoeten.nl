# remcostoeten.nl

Source for [remcostoeten.nl](https://remcostoeten.nl), a personal website built with Next.js.  
It combines a portfolio-style marketing site, an MDX blog, a protected admin area, and a small activity system that pulls GitHub and Spotify data into Postgres.

![Preview of remcostoeten.nl](./public/images/readme/site-preview.png)

## What this project includes

- A homepage with work experience, featured projects, and personal profile content
- A filesystem-based MDX blog with topics, RSS, syntax highlighting, and draft support
- An admin area for managing project visibility and internal content workflows
- GitHub and Spotify integrations for recent activity and listening data
- A contact flow backed by server actions and database persistence
- Optional analytics and email integrations for production deployments

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

- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` for GitHub OAuth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` for Google OAuth
    - `GITHUB_TOKEN` for server-side GitHub API access
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, `SPOTIFY_REDIRECT_URI` for Spotify data
- `IP_INFO_TOKEN` for IP geolocation https://ipinfo.io/
- `CRON_SECRET` for protected sync endpoints
  <small>💡 For automated GitHub (and Google) OAuth creation view <a target="_blank" href="https://github.com/remcostoeten/oauth-app-automator">OAuth App Automator</a></small>

If an optional integration is missing, the related feature will be limited or disabled rather than preventing the whole app from running.

## Scripts

```bash
bun run dev      # dev
bun run check    # lint + typecheck + test
bun run build    # release
```
