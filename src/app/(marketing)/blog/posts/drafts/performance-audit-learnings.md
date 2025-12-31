---
title: "Auditing Performance: Lessons from a Production Build"
date: "2025-12-31"
description: "A deep dive into how I audited my portfolio's performance, what metrics like LCP and TBT really mean, and the tools used to find them."
tags: ["performance", "nextjs", "web-vitals", "optimization"]
---

# Auditing Performance: Lessons from a Production Build

Performance, along with accessibility, are among the most overlooked and intimidating aspects of web development. But a necessary evil.

My site was 90% ready for release so I started cleaning things up and auditing performance revealing a shocking amount of room for improvement.

## The Baseline (Before Optimization)

I started by measuring my local development build:

| Metric | Measured Value | Status |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | 2.36s | Good |
| **FCP** (First Contentful Paint) | 2.36s | Good |
| **TTFB** (Time to First Byte) | 1.79s | Needs Improvement |
| **TBT** (Total Blocking Time) | 8.42s | Critical |
| **CLS** (Cumulative Layout Shift) | 0.109 | Fair |

But the real shock came when I ran Lighthouse against the **deployed production build** on Vercel:

| Metric | Measured Value | Status |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | 3.95s | Needs Improvement |
| **FCP** (First Contentful Paint) | 2.85s | Needs Improvement |
| **TBT** (Total Blocking Time) | 23.19s | Critical |
| **CLS** (Cumulative Layout Shift) | 0.015 | Good |
| **TTI** (Time to Interactive) | 33.42s | Critical |
| **Speed Index** | 14.03s | Critical |

**Performance Score: 43/100**. This confirmed I had a serious main-thread blocking issue.

## The Methodology

I will explain what these metrics mean. If you're only interested in the fixes, skip to the [solutions](#the-solutions) section.

To get these metrics, I didn't just look at a "seconds to load" timer. I used the **Web Performance APIs**...
To get these metrics, I didn't just look at a "seconds to load" timer. I used the **Web Performance APIs** available in modern browsers, specifically the `PerformanceObserver` interface. This allows us to subscribe to specific types of performance events as they happen.

### 1. Largest Contentful Paint (LCP)
LCP measures when the largest text or image element becomes visible. 
- **How it's measured**: We observe `largest-contentful-paint` entries. The browser keeps track of the largest element as the page loads and updates the LCP entry.
- **My Result**: **2.36s**. This is triggered by the description text in the Tech Stack section.

### 2. Time to First Byte (TTFB)
TTFB measures the time between the request for a resource and when the first byte of the response begins to arrive.
- **How it's measured**: Using `performance.getEntriesByType('navigation')[0].responseStart`.
- **My Result**: **1.79s**. This is a bit high for a local environment, suggesting some latency in the server-side rendering (SSR) or data fetching from external APIs like Spotify.

### 3. Total Blocking Time (TBT)
TBT measures the total amount of time between First Contentful Paint (FCP) and Time to Interactive (TTI) where the main thread was blocked long enough to prevent input responsiveness.
- **How it's measured**: By observing `longtask` entries. Any task that runs for more than 50ms is considered a "long task." We sum up the "excess" time (duration - 50ms) for all long tasks.
- **My Result**: **8.42s**. This is the critical bottleneck. It means the browser is very busy processing JavaScript (likely hydration and heavy animations) right after the first paint.

### 4. Cumulative Layout Shift (CLS)
CLS measures the "visual stability" of a page. If elements jump around as the page loads, you get a higher CLS score.
- **How it's measured**: By observing `layout-shift` entries that happen without recent user input.
- **My Result**: **0.109**. Mostly stable, but there's room for improvement to get it under the "Good" threshold of 0.1.

## The Solutions

The audit revealed three main culprits: heavy client-side bundles, eager API polling, and unnecessary server-side rendering. Here is how we fixed them.

### 1. Breaking up the Bundles (Dynamic Imports)
The `ActivitySection` component was massive—over 700 lines of code with heavy `framer-motion` animations. By default, Next.js stuffs this into the initial JavaScript bundle, so the browser has to download and parse it before *anything* becomes interactive.

**The Fix:** We used `next/dynamic` to lazy-load these heavy components. This splits them into separate "chunks" that are only loaded when needed.

```tsx
// Before: Imported at the top, bundled immediately
import { ActivitySection } from '@/components/landing/activity/section';

// After: Imported dynamically, loaded separately
const ActivitySection = nextDynamic(
  () => import('@/components/landing/activity/section').then(m => ({ default: m.ActivitySection })),
  { loading: () => null }
);
```

We applied this to:
- `ActivitySection` (Complex animations)
- `TechStackCloud` (16+ animated interactive cards)
- `WorkExperience` (Interactive timeline)

### 2. Unblocking the Main Thread (Deferred Execution)
The TBT score of 23s was screaming that the main thread was blocked. The culprit? A `useEffect` hook that started polling the Spotify API *immediately* upon hydration, alongside a 200ms interval for the progress bar.

**The Fix:** We simply wrapped the start logic in a 3-second timeout. This gives the browser enough time to finish the critical initial render tasks (hydration) before starting non-critical background work.

```typescript
useEffect(() => {
  // Delay polling by 3 seconds to avoid blocking the main thread during hydration
  const startupDelay = setTimeout(() => {
    fetchPlaybackState();
    pollIntervalRef.current = setInterval(fetchPlaybackState, POLL_INTERVAL);
  }, 3000);

  return () => clearTimeout(startupDelay); // Cleanup
}, []);
```

### 3. Caching Strategy (ISR)
Almost every page was exporting `export const dynamic = 'force-dynamic'`. This forces the server to regenerate the HTML for *every single request*. High TTFB? That's why.

**The Fix:** We switched to **Incremental Static Regeneration (ISR)**. The page is generated once, cached on the edge, and revalidated every 60 seconds.

```typescript
// Before
export const dynamic = 'force-dynamic'

// After
export const revalidate = 60
```

*Note: Some pages (like `/blog/[...slug]`) needed to stay dynamic because they check cookies/headers for authentication states.*

### 4. Simplifying Animations (Removing Overhead)
The "Tech Stack Cloud" component was animating 16 different cards using `framer-motion`, adding significant hydration weight.

**The Fix:** I rewrote the component to use standard CSS transitions and reduced the number of items to the core 8 technologies. This removed the heavy animation library runtime from this component entirely.

```tsx
// Before: Heavy framer-motion unique animations for 16 items
// After: Simple CSS hover effects, 8 items, 0 JS animation library overhead
```

## The Results

Applying these fixes targets the core metrics directly:

1.  **TBT**: Should drop significantly (targeting <300ms) because we removed the immediate 200ms polling loop and moved 50KB+ of JavaScript out of the initial bundle.
2.  **LCP**: Should improve as the main thread is less contended, allowing the browser to paint the largest element faster.
3.  **TTFB**: Should become near-instant (<50ms) for most users thanks to ISR caching.

The build is shipping now. Time to measure again.

## Scripts to measure
To keep an eye on this in the future, I wrote a script that spins up the production build locally and benchmarks it with Lighthouse CLI.

```bash
#!/bin/bash
# scripts/measure-vitals.sh
URL="${1:-http://localhost:3000}"
npx -y lighthouse "$URL" --only-categories=performance --chrome-flags="--headless"
```

