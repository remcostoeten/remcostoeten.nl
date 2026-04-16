---
title: "What I've been shipping lately"
publishedAt: '2026-04-16'
updatedAt: '2026-04-16'
summary: 'A lightweight running log of what I have been building, what shipped, what changed, and what I am paying attention to next.'
tags: ['Personal', 'Build Log', 'Shipping']
topic: 'Personal'
author: 'Remco Stoeten'
slug: 'what-ive-been-shipping-lately'
draft: true
---

Lately I have been trying to ship smaller things more often instead of waiting until a project feels "finished." This post is a simple running note: what went out, what changed behind the scenes, what is still rough, and what I want to improve next.

It is less of a polished launch post and more of a snapshot. A place to document momentum while the work is still fresh.

## What shipped

- **[ @remcostoeten/analytics ]**  
  There was no real reason for this, besides me wanting to roll my own service and learn some more back-end. It's a privacy-first, event-sourced analytics engine built on **Bun**, **Hono** (Vercel Edge), and **Neon/Postgres**. It leverages JSONB for a schema-less event stream that supports advanced forensics (Browser/OS parsing) out of the box.
  
  - **Possibilities**: Track Web Vitals (LCP, CLS, INP), E-commerce revenue, A/B test variants, and full user funnels without migrations.
  - **Usage**:
    ```tsx
    <Analytics ingestUrl="https://ingest.remcostoeten.nl" />
    ```
  - **GitHub**: [remcostoeten/analytics](https://github.com/remcostoeten/analytics)
  - **Live Demo**: [analytics.remcostoeten.nl](https://analytics.remcostoeten.nl)

- **[ @remcostoeten/use-shortcut ]**  
  I built this because existing shortcut libraries felt clunky. I wanted a "human-readable" API that felt like writing a sentence, with perfect TypeScript autocompletion for every key and modifier. 

  - **Tech Talk**: A zero-dependency React hook built with a fluent/chainable builder pattern. It handles event listener cleanup automatically and supports advanced modifier combinations without manual string parsing.
  - **Possibilities**: Support for command combos (Ctrl/Cmd + K), sequential key presses (G then H), global/scoped listeners, and automatic documentation generation via description tags.
  - **Usage**:
    ````tsx
    useShortcut()
      .cmd('k')
      .action(() => setOpen(true))
      .description('Open command palette')
      .build();
    ````
  - **GitHub**: [remcostoeten/use-shortcut](https://github.com/remcostoeten/use-shortcut)
  - **Live Demo**: [use-shortcut.vercel.app](https://use-shortcut.vercel.app)

- **[ oauth-app-automator ]**  
  I hate creating OAuth applications when using social providers. Thus I automated the process with a Python program. Authenticate once and from there you're able to create, (bulk) delete apps and test credentials. Write secret and client ID to clipboard, or straight in your environment variable.

  - **Tech Talk**: Python-based automation that scripts the actual browser interactions (via Selenium/Playwright) to fetch credentials directly from provider portals (GitHub/Google).
  - **Possibilities**: Bulk creation of developer apps, automatic `.env` file updates, and a clean interactive CLI/TUI for managing credentials.
  - **GitHub**: [remcostoeten/oauth-app-automator](https://github.com/remcostoeten/oauth-app-automator)

- **[ Kuizer ]**  
  Maintaining large TypeScript projects often leads to "dead code rot." I needed a fast, reliable way to prune the tree without manual auditing—so I built Kuizer to handle the heavy lifting.

  - **Tech Talk**: A high-performance CLI built with **Bun**. It analyzes the TypeScript import graph to detect unreachable files and unused exports by deep-diving into the AST.
  - **Possibilities**: Browse findings in an interactive terminal UI (TUI), categorize unused exports (types vs components), and safe snapshot-based rollbacks for every automated fix.
  - **Usage**:
    ````bash
    kuizer detect --interactive
    ````
  - **GitHub**: [remcostoeten/kuizer](https://github.com/remcostoeten/kuizer)

## What changed while building it

Most things never ship exactly as planned. The interesting part is usually what changed in the process.

For this round, that looked something like this:

- I cut the complex relational schema for a flat JSONB event stream to speed up iteration.
- I rewrote the background beacon logic to use native `sendBeacon` for 100% reliability on page unloads.
- I kept the query layer thin, moving the analytical heavy lifting to Postgres window functions.

This shift to a "Data-First" architecture meant I could stop worrying about database migrations every time I wanted to track a new custom property—I just start sending it and the JSONB column handles the rest.

## What is still rough

Not everything is done, and that is fine.

Right now, the main things still on my list are:

- **Dashboard UI**: The visuals are still minimal; it needs more "wow" factor on the charts before I'm fully happy with it.
- **Attribution Models**: Currently only supports First-Touch; linear and decay models are postponed for later this month.
- **Query Performance**: At massive scales (1M+ events), the JSONB extractions will need functional indexes to stay performant.

This section is useful because it keeps the post honest. Shipping is usually a sequence of acceptable versions, not a single perfect release.

## What I learned

A few reminders from this cycle:

- **Small releases create clarity faster than private polishing.** Pushing v1.1.0 and then v1.1.1 immediately helped me see where the SDK surface was too verbose.
- **The boring version that works is usually more valuable.** Native browser beacons are "boring" but significantly more reliable than trying to manage complex WebSockets for analytics pings.
- **Writing down what changed makes the next iteration easier.** Creating a separate "Agent Spec" documentation file felt like extra work, but it allowed me to build the query logic twice as fast.

## Next up

The next things I want to spend time on:

- **Funnel Builder**: A drag-and-drop UI to define conversion steps on the fly.
- **User Retention**: Weekly/Monthly retention heatmap visualization.
- **Plugin System**: Allowing custom ingestion middleware to filter bots or enrich payloads server-side.

I will probably come back to this format again. It is a good way to keep a public trail of what is actually getting made instead of only writing when something feels big enough to announce.
