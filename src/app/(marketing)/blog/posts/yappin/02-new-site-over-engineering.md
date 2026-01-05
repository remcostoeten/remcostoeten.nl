---
title: 'My new site caused 3 npm packages and my best side project yet'
publishedAt: '31-12-2025'
summary: 'Scope creep and side projects are always a risk for personal projects. But I might have overdone it this time.'
tags: ["Engineering", "Blog", "Personal"]
---

I've had dozens of portfolio sites. Some quite [cool](https://minimal-graphql-portfolio-git-master-remcostoeten.vercel.app/) (desktop only). [Some](https://remco-tools-git-dev-remcostoeten.vercel.app/)... not so much. Although that was my first ever. The goal was to build a minimal, dark site with the ability to share content so I can sunset my [snippets](https://snippets-remcostoeten.vercel.app/) site some day. No scope creep this time!

You know that feeling when you start a simple project and somehow end up with a distributed microservices architecture for a to-do list? That's exactly what happened with my personal site.

Started off with getting design inspiration which took me days. Or well... This is, without joking, nearly the 20th iteration of my personal site. Some well over 100 commits. Never, ever am I happy with my designs. Although this one was quite cool. This one, although I ended up using it for a dashboard, is probably the sickest design I've built.

## Initial Plan

Haven't had a personal site for a year. Lately loving the minimalist design, to the point and anti-Awwwards. Built a personal site with a minimalist look, dark, and a system to render markdown files as a blog.

## Off Track

Suddenly I get the urge to build something complex. I always hop around 3 projects because of self-induced neuron deficiency. How cool would it be to build a CMS that allows you to write blogs via a [Tiptap](https://tiptap.dev/) editor that writes to the filesystem as `.mdx`. Yeah cool. But not doable in a serverless environment. And also F rich text editors man. Working with editors is such a pain.

Moving on. Let's just do content editing. Installed `drizzle-orm`, added a PostgreSQL database. Created some endpoints and was able to mutate and query. But this feels too static.

## Flexibility

That's it! So I made a widget system with full composability in positioning, prop usage, theming, and content. Obviously spent way too long on the design with half-baked features. Ended up scrapping this.

## Back on Track?

So I scrapped the CMS. The only reason I built it anyway was to show off, not to use it. I was debating on scrapping but insisted on finishing this project for once.

So I got the rough design out of the way. Took some Vercel boilerplate for markdown parsing because ain't nobody got time for that. Call it skill issue all you want.

Built the design, picked an aesthetic color scheme, built myself an aesthetic codeblock and *et voila*.

## Sike

A blog actually needs view counting right? I've integrated PostHog earlier, but that's not cool. So I insisted on rolling my own. In Hono.js. With close to no back-end skills except for what we do in Next.js. Hono turned out relatively easy though.

Suddenly we went to a monorepo. Deployment is a pain, but I managed on Fly.io. Struggled with CORS for a couple of days on and off but it ran. And worked, I think. At least, some features do.

## Activity

I wanted some GitHub activity on my homepage. GitHub API is dead simple so there's that. Wanted Spotify activity too. That API has you crying with their token retrieval. But I got it working.

But I never want to do that again. So I built **`fync`** ([`remcostoeten/fync`](https://github.com/remcostoeten/fync)), an npm package that allows working with data from various APIs in a unified, chainable syntax. Not only for Spotify and GitHub. But NPM, GitLab, Linear, Vercel, Notion and probably more... With package releases comes dozens of bugs. Not the most fun experience when you just want to build a quick blog site. But I'm proud of it.

In the meanwhile I started building a Tauri desktop notes application. And a local-first, near instantaneous code-linear clone. Both are scrapped.

## Query Data

Hmm I query often, I always use `drizzle-orm`. I can't remember the syntax, ever. Why don't I build a simple abstraction for it that allows me to do this:

```typescript title="drizzleasy-example.ts"
import { read } from "@remcostoeten/drizzleasy";

const renderPosts = read("posts");
```

And so, **[drizzleasy](https://drizzleasy.vercel.app/docs)** was born.

This fetches all the posts from the `posts` table. Obviously also built `create()`, `update()`, and `destroy()`. I wanted to keep it simple but over time I added more features. Automatic database pooling, connection, hooks for optimistic updates, filtering, couple of chainable methods. You know, just a simple GET request was needed right?

Which is a simple CLI to fetch and sync data from various sources. It's a bit rough around the edges but it works. And I'm proud of it.

## TL;DR

Did we count? That's from a simple way to render markdown to:

- An NPM package to query all famous APIs
- A scrapped simple CMS
- A scrapped advanced widget CMS
- A custom syntax highlighted codeblock component, separate repository
- A Hono.js backend for blog views
- An npm package for working with drizzle in a simple way
- And an honorable mention to my attempts in building a local first project management tool in order to manage this chaos. Tried Rocicorp and their Zerosync, even contributed. Moved to pglite (Postgres running in the browser!), tinkered around with Turso's offline store and lastly got Zerosync predecessor to work, only to find out it's deprecated. I just gave up.

## Fin

And you know what's the real joke? Eventually I ended up not using `drizzleasy` nor `fync` because I wanted to ship using managing version bumps, fixing bugs whilst trying to ship this and maintain some energy for my real job was not the move so I ended up just using the plain REST API.

They are implemented in other projects though and work fine.

Remco
