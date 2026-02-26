---
title: '02. New year, new site & over-engineering'
publishedAt: '2025-12-31'
summary: 'What was supposed to be a minimal dark blog turned into two npm packages, a custom backend, a scrapped CMS, and a existential crisis.'
tags: ['Engineering', 'Blog', 'Personal']
---

Nearly the 20th iteration of my personal site. Some were [decent](https://minimal-graphql-portfolio-git-master-remcostoeten.vercel.app/) (desktop only), some were [rough](https://remco-tools-git-dev-remcostoeten.vercel.app/). The goal this time: minimal, dark, markdown blog. Sunset the old [snippets site](https://snippets-remcostoeten.vercel.app/). No scope creep.

## The Plan

No personal site for a year. Lately into anti-Awwwards minimalism. Dark theme, markdown rendering, done.

## Immediately Off Track

Markdown files are the obvious approach. Instead I built a custom CMS, only to realize serverless doesn't support writing to the filesystem. Had most of it working too: widgets, re-ordering, data layer. Considered switching to a database with a rich text editor but I'm already building [skriu](https://skriuw.vercel.app/) for that. Scrapped it.

## Rolling My Own Analytics

PostHog was already integrated but felt like cheating. Built my own view counter in Hono.js with barely any backend experience. Hono was surprisingly straightforward.

This also meant a monorepo. Deployed to Fly.io. Fought CORS for days. It ran. Mostly.

## Activity Feeds

GitHub API for the homepage activity feed was trivial. Spotify's OAuth token flow was not. Got it working eventually.

Then I decided I never wanted to deal with that again, so I built **[fync](https://github.com/remcostoeten/fync)**: a unified, chainable API client for Spotify, GitHub, NPM, GitLab, Linear, Vercel, Notion. Package releases introduced dozens of bugs. Not ideal when you're trying to ship a blog.

Somewhere in this period I also started a Tauri desktop notes app and a local-first Linear clone. Both scrapped.

## Abstracting Drizzle

I use `drizzle-orm` everywhere but can never remember the syntax. So naturally I built an abstraction:

```typescript title="drizzleasy-example.ts"
import { read } from '@remcostoeten/drizzleasy'

const renderPosts = read('posts')
```

**[drizzleasy](https://drizzleasy.vercel.app/docs)** started as a thin wrapper. Then I added `create()`, `update()`, `destroy()`, automatic connection pooling, optimistic update hooks, filtering, chainable methods. A simple GET request was all I needed.

## The Damage Report

What started as "render some markdown" became:

- Two npm packages ([fync](https://github.com/remcostoeten/fync), [drizzleasy](https://drizzleasy.vercel.app/docs))
- A scrapped CMS (twice, simple and widget-based)
- A custom syntax-highlighted codeblock component in its own repo
- A Hono.js analytics backend
- Failed attempts at local-first project management: Replicache/Zerosync (contributed, then deprecated), pglite (Postgres in the browser), Turso's offline store

## The Punchline

I shipped without `drizzleasy` or `fync`. Managing version bumps and fixing package bugs while trying to maintain energy for my actual job was not sustainable. Plain REST API it is.

Both packages work fine in other projects though.

Remco
