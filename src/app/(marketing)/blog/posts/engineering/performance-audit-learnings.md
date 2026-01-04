---
title: "Auditing Performance: Lessons from a Production Build"
date: "2025-12-31"
description: "A deep dive into how I audited my portfolio's performance, what metrics like LCP and TBT really mean, and the tools used to find them."
tags: ["Engineering", "Next.js", "SEO"]
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

<Video src="/draft-demo.mp4" width="800" height="450" className="my-8" />

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

## The Regression & Recovery (Part 2)

After deploying the first batch of fixes (dynamic imports + ISR), I ran the metrics again. The results were... unexpected.

| Metric | Deployment #1 | Status |
| :--- | :--- | :--- |
| **TBT** | 14.13s | Improved (from 23s) but Critical |
| **CLS** | **0.632** | **CRITICAL REGRESSION** (from 0.015) 🔴 |

### What happened?
We traded one problem for another. By dynamically importing `TechStackCloud` and `ActivitySection` with `loading: () => null`, we caused the layout to shift dramatically when they finally loaded in. The page content would jump down ~500px, then jump back up when the components rendered.

### The Fix: Precise Skeletons
To fix the CLS, I had to implement skeletons that **perfectly matched** the final dimensions of the loaded components.

1.  **Tech Stack**: Created a skeleton for the exact 8-card grid layout.
2.  **Activity Section**: Replicated the `Section` padding and `ContributionGraph` height (120px) exactly.

**Crucial Lesson**: Standard `py-24` padding in my initial skeleton was *too tall*, causing a shift *upwards* when real content loaded. Precision is key.

### The Remaining TBT (Deferred Execution)
Even with TBT down to 14s, it was still critical. The culprit was `ActivityFeed`—a heavy component with intervals and `framer-motion` springs running immediately on mount.

**The Strategy**: **Deferred Execution**.
Instead of letting these components hydrate immediately, I wrapped their heavy logic in a "readiness" check:

```tsx
const [isReady, setIsReady] = useState(false);

useEffect(() => {
    // Wait for 3.5s - let the main thread breathe!
    const timer = setTimeout(() => setIsReady(true), 3500);
    return () => clearTimeout(timer);
}, []);

useEffect(() => {
    if (!isReady) return; 
    // ... heavy fetch and intervals start here
}, [isReady]);
```

This ensures the main thread is completely free during the critical first few seconds of page load.

## Final Results

After fixing the skeletons and deferring the activity feed:

| Metric | Final Value | Status |
| :--- | :--- | :--- |
| **LCP** | 4.57s | Acceptable (Net improvement vs load) |
| **CLS** | **0.065** | **FIXED** (Green < 0.1) 🟢 |
| **TBT** | **10.78s** | **Improved** (From 23s -> 10s) 🟢 |

We cut the Total Blocking Time by over **50%** and completely resolved the Layout Shift regressions. Performance engineering is an iterative game of whack-a-mole—but we won this round.

## Latest Measurements (Dec 31, 2025)

After the latest round of optimizations—deferring hydration for the activity feed and graph components (`8ceb44b`), aligning skeleton heights (`960da13`), and moving the tech stack section below the fold (`3816fbd`)—here are the current metrics:

| Metric | Measured Value | Status |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | 3.76s | 🟡 Needs Improvement |
| **FCP** (First Contentful Paint) | 2.94s | 🟡 Needs Improvement |
| **TBT** (Total Blocking Time) | 1.71s | 🔴 Critical |
| **CLS** (Cumulative Layout Shift) | 0.305 | 🔴 Critical |
| **TTI** (Time to Interactive) | 8.17s | 🔴 Critical |
| **Speed Index** | 3.26s | 🟢 Good |

**Performance Score: 41/100**

### The "Score" vs. Reality

If you look at the 41/100 score, you might think the site is broken. The truth is more nuanced. We are effectively "cheating" the initial load by pushing work to later.

**The Trade-off:**
1.  **Speed Index (3.26s) is Good:** The user sees the content and can read quickly. This is the primary goal for a blog.
2.  **Deferred Pain:** By delaying hydration, we didn't magically delete the JavaScript execution time; we just moved it out of the initial load window. 
3.  **The Risk:** If a user tries to interact (e.g., toggle the theme) *exactly* at the 3.5-second mark when our heavy components wake up, they might feel a stutter. 

### The Real Win: TBT Reduction
We dropped Total Blocking Time from **23s to 1.7s**. 
- **Before:** The browser was unresponsive for nearly 30 seconds versus now not really noticeable.
- **Reality Check:** 1.7s is still considered "poor" by Google standards (target is <200ms). However, unlike the 23s disaster, this is a distinct compromise I'm willing to make for the sake of having a rich, animated UI on a personal site.

This was the result of tinkering around a hour or two. I know the Spotify & GitHub feed are the culprits here, but I'd rather enjoy the experience and offer a bit of personality than having a perfect score. The goal was digging into the performance metrics and learning from them. 

With the Github and spotify API disabled:


```text
📊 Web Vitals Results
────────────────────────────────────────────────────────────
LCP          │ 2.46s    │ 🟢 Good
FCP          │ 2.14s    │ 🟢 Good
TBT          │ 0.19s    │ 🟢 Good
CLS          │ 0.050    │ 🟢 Good
TTI          │ 4.2s     │ 🟡 Needs Improvement
Speed Index  │ 2.14s    │ 🟢 Good
────────────────────────────────────────────────────────────
Performance Score: 89/100
```
## Scripts to measure
To keep an eye on this in the future, I wrote a script that spins up the production build locally and benchmarks it with Lighthouse CLI.

```bash
#!/bin/bash
# scripts/measure-vitals.sh
URL="${1:-http://localhost:3000}"
npx -y lighthouse "$URL" --only-categories=performance --chrome-flags="--headless"
```

