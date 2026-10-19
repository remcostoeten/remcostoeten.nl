<p align="center">
  <img src="public/icon-192.png" width="88" alt="remcostoeten.nl logo" />
</p>

<h1 align="center">remcostoeten.nl</h1>

<p align="center">Source for <a href="https://remcostoeten.nl">remcostoeten.nl</a>, the personal website, blog and toolbox of Remco Stoeten.</p>

<p align="center">
  <img src="https://shieldcn.dev/github/remcostoeten/remcostoeten.nl/ci.svg?font=jetbrains-mono" alt="CI" />
  <img src="https://shieldcn.dev/badge/framework-Next.js%2016-black.svg?font=jetbrains-mono&logo=nextdotjs" alt="framework: Next.js 16" />
  <img src="https://shieldcn.dev/badge/runtime-Bun-black.svg?font=jetbrains-mono&logo=bun" alt="runtime: Bun" />
  <img src="https://shieldcn.dev/badge/database-Postgres-black.svg?font=jetbrains-mono&logo=postgresql" alt="database: Postgres" />
  <img src="https://shieldcn.dev/badge/deploy-Vercel-black.svg?font=jetbrains-mono&logo=vercel" alt="deploy: Vercel" />
  <img src="https://shieldcn.dev/badge/deploy-Cloudflare%20Workers-black.svg?font=jetbrains-mono&logo=cloudflare" alt="deploy: Cloudflare Workers" />
</p>

<p align="center">
  <img src=".github/assets/demo.webp" width="100%" alt="Scrolling the homepage from the intro and tech stack through experience, projects and UI resources, then opening the blog and tools pages" />
</p>
<p align="center">
  <sub>Recorded on a local dev server of this branch at 1440×900.</sub>
</p>

The site is a Next.js App Router application that deploys to Vercel or Cloudflare Workers. Activity data such as GitHub commits and Spotify playback is fetched from the GitHub and Spotify APIs, and a signed-in admin area edits the content behind the public pages.

- **Blog** written as markdown files in the repo, with topics, drafts, RSS, callouts, syntax highlighting, reactions and comments.
- **Activity feed** showing recent GitHub commits and current Spotify listening on the homepage.
- **Browser tools** at `/tools`: diff checker, JSON formatter, SVG and HEIC converters, link extractor, find and replace, and a few map utilities.
- **Package pages** at `/packages` documenting the open-source React packages published under `@remcostoeten`.
- **Admin area** behind GitHub or Google sign-in for the intro, experience, projects, blog, contact submissions and analytics.
- **Contact form** backed by server actions and stored in Postgres.
- **SEO** handled per route: generated Open Graph images, sitemap, robots, manifest and canonical URLs.

## Development

Node 24 and Bun 1.3 are required, plus a Postgres connection string. Neon works out of the box.

```bash
bun install                 # install dependencies
cp .env.example .env.local  # then fill in DATABASE_URL, BETTER_AUTH_URL and BETTER_AUTH_SECRET
bun run db:push             # push the Drizzle schema to the database
bun run dev                 # start the dev server on http://localhost:3000
bun run check               # oxlint, tsgo typecheck and vitest
```

Every other variable in `.env.example` enables one integration (GitHub, Google, Spotify, YouTube Music, PostHog, ipinfo). A missing one disables its feature instead of breaking the build. The GitHub and Google OAuth apps can be created with [oauth-app-automator](https://github.com/remcostoeten/oauth-app-automator).

Server code lives under `src/server`, route handlers stay thin and delegate to it, and blog posts are read from `src/app/(marketing)/blog/posts` and enriched with topic and reading time at build.

## Deployment

The same code deploys to either host.

**Vercel** is the default. `vercel.json` pins the framework and runs `next build`; push to the connected branch.

**Cloudflare Workers** runs through [vinext](https://github.com/cloudflare/vinext), which builds the Next.js app with Vite. `cloudflare.config.ts` declares the Worker, a KV namespace for the data cache and the secrets the app reads.

```bash
cp .env .dev.vars                                         # secrets for the local Worker
bun run build:vinext                                      # build into .cloudflare/output
bun run start:vinext                                      # run the built Worker on http://localhost:4173
bunx cf deploy --prebuilt --secrets-file .env.production  # upload the build and its secrets
```

`NEXT_PUBLIC_*` variables are inlined at build time, so set them in the environment of `bun run build:vinext`. `bun run dev` and `bun run build` use the plain Next.js toolchain; set `BUILD_TARGET=vinext` to make `bun run build` finish with the Vite build instead.

<br/>

xxx,<br/>
[Remco Stoeten](https://remcostoeten.com)<br/>
<small>MIT</small>
