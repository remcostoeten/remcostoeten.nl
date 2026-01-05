---
title: "Auditing Performance: Lessons from a Production Build"
date: "2025-12-31"
description: "A deep dive into how I audited my portfolio's performance, what metrics like LCP and TBT really mean, and the trade-offs of building a rich, personal site."
tags: ["Engineering", "Next.js", "Performance"]
---

The reason I'm writing this is because like most this part of front-end is often neglected and I wanted to dive into how blocking threads and certain code will affect loadtimes, or what metrics like LCP and TBT really mean. 

Performance and accessibility are among the most overlooked aspects of web development—yet they're essential. My site was 90% ready for release, so I ran a performance audit expecting minor tweaks. What I found was far worse.


## The Baseline (Before Optimization)

My local development build looked reasonable:

| Metric                             | Measured Value | Status            |
| :--------------------------------- | :------------- | :---------------- |
| **LCP** (Largest Contentful Paint) | 3.95s          | Needs Improvement |
| **FCP** (First Contentful Paint)   | 2.85s          | Needs Improvement |
| **TBT** (Total Blocking Time)      | **23.19s**     | Critical          |
| **TTI** (Time to Interactive)      | 33.42s         | Critical          |
| **Score**                          | **43/100**     | Critical          |

But the **deployed production build** on Vercel told a different story:

| Metric | Measured Value | Status |
| :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | 3.95s | Needs Improvement |
| **FCP** (First Contentful Paint) | 2.85s | Needs Improvement |
| **TBT** (Total Blocking Time) | 23.19s | Critical |
| **CLS** (Cumulative Layout Shift) | 0.015 | Good |
| **TTI** (Time to Interactive) | 33.42s | Critical |
| **Speed Index** | 14.03s | Critical |

**Performance Score: 43/100.** I had a serious main-thread blocking issue.


## The Methodology

*If you're only interested in the fixes, skip ahead to [The Solutions](#the-solutions).*

To get these metrics, I used the **Web Performance APIs** available in modern browsers—specifically the `PerformanceObserver` interface. This lets you subscribe to specific performance events as they happen.

### 1. Largest Contentful Paint (LCP)
LCP measures when the largest text or image element becomes visible.

- **How it's measured**: Observe `largest-contentful-paint` entries. The browser tracks the largest element as the page loads.
- **My result**: **2.36s** — triggered by the description text in the Tech Stack section.

### 2. Time to First Byte (TTFB)
TTFB measures the time between requesting a resource and receiving the first byte.

- **How it's measured**: `performance.getEntriesByType('navigation')[0].responseStart`
- **My result**: **1.79s** — a bit high, suggesting SSR or external API latency (like Spotify).

### 3. Total Blocking Time (TBT)
TBT measures how long the main thread was blocked between FCP and TTI, preventing user input.

- **How it's measured**: Observe `longtask` entries. Any task over 50ms is a "long task"—we sum up the excess time.
- **My result**: **8.42s** — the critical bottleneck. The browser was busy hydrating heavy animations.

### 4. Cumulative Layout Shift (CLS)
CLS measures visual stability—how much elements jump around as the page loads.

- **How it's measured**: Observe `layout-shift` entries that occur without user input.
- **My result**: **0.109** — mostly stable, but ideally below 0.1.


## The Solutions

The audit revealed three culprits: **heavy client-side bundles**, **eager API polling**, and **unnecessary server-side rendering**.

### 1. Breaking up the Bundles (Dynamic Imports)

The `ActivitySection` component was massive—700+ lines with heavy `framer-motion` animations. By default, Next.js bundles everything together, so the browser has to download and parse it all before anything becomes interactive.

**The Fix:** Use `next/dynamic` to lazy-load heavy components into separate chunks.

```tsx title="dynamic-import.tsx"
// Before: Imported at the top, bundled immediately
import { ActivitySection } from '@/components/landing/activity/section';

// After: Imported dynamically, loaded separately
const ActivitySection = nextDynamic(
  () => import('@/components/landing/activity/section').then(m => ({ default: m.ActivitySection })),
  { loading: () => <ActivitySkeleton /> }
);
```

### 2. Unblocking the Main Thread (Deferred Execution)

The 23s TBT was caused by a `useEffect` hook that started polling the Spotify API *immediately* on hydration, plus a 200ms progress bar interval.

**The Fix:** Wrap the start logic in a 3-second timeout, giving the browser time to finish hydration first.

```typescript title="deferred-polling.ts"
useEffect(() => {
  // Delay polling by 3 seconds to avoid blocking during hydration
  const startupDelay = setTimeout(() => {
    fetchPlaybackState();
    pollIntervalRef.current = setInterval(fetchPlaybackState, POLL_INTERVAL);
  }, 3000);

  return () => clearTimeout(startupDelay);
}, []);
```

### 3. Caching Strategy (ISR)

Almost every page had `export const dynamic = 'force-dynamic'`, forcing the server to regenerate HTML for every request. High TTFB? That's why.

**The Fix:** Switch to **Incremental Static Regeneration (ISR)**—generate once, cache on the edge, revalidate every 60 seconds.

```typescript title="isr-config.ts"
// Before
export const dynamic = 'force-dynamic'

```typescript title="isr-config.ts"
export const revalidate = 60 // regenerate at most once per minute
```

*Note: Pages like `/blog/[...slug]` stayed dynamic because they check cookies for auth.*

### 4. Simplifying Animations (Removing Overhead)

The Tech Stack Cloud was animating 16 cards with `framer-motion`, adding significant hydration weight.

**The Fix:** Rewrote it with CSS transitions and reduced to 8 core technologies—zero JS animation overhead.


## The Results

After deploying these fixes, I expected victory. Instead, I got a lesson in trade-offs.

| Metric | After Deployment | Status |
| :--- | :--- | :--- |
| **TBT** | 14.13s | Improved (from 23s) but still Critical |
| **CLS** | **0.632** | **CRITICAL REGRESSION** (from 0.015) 🔴 |

### What Happened?

We traded one problem for another. By dynamically importing components with `loading: () => null`, we caused the layout to shift dramatically when they finally loaded—content jumping 500px down, then back up.

### The Fix: Precise Skeletons

To fix CLS, I implemented skeletons that **perfectly matched** the final component dimensions.

1. **Tech Stack**: Created a skeleton matching the exact 8-card grid layout
2. **Activity Section**: Replicated the padding and graph height (120px) precisely

**Crucial lesson**: My initial skeleton used `py-24` padding, which was *too tall*, causing an upward shift when real content loaded. Precision is everything.

### The Remaining TBT (Deferred Execution)

Even at 14s TBT, `ActivityFeed` was still the culprit—running intervals and `framer-motion` springs immediately on mount.

```tsx title="deferred-execution.tsx"
const [isReady, setIsReady] = useState(false);

useEffect(() => {
    // Wait 3.5s — let the main thread breathe
    const timer = setTimeout(() => setIsReady(true), 3500);
    return () => clearTimeout(timer);
}, []);

useEffect(() => {
    if (!isReady) return; 
    // ... heavy fetch and intervals start here
}, [isReady]);
```

This ensures the main thread is free during the critical first few seconds.


## Final Results

After fixing skeletons and deferring the activity feed:

| Metric | Final Value | Status |
| :--- | :--- | :--- |
| **LCP** | 4.57s | Acceptable |
| **CLS** | **0.065** | **Fixed** 🟢 |
| **TBT** | **10.78s** | **Improved** (from 23s → 10s) |

We cut Total Blocking Time by over **50%** and resolved the Layout Shift regressions. Performance engineering is an iterative game of whack-a-mole—but we won this round.

We consciously traded a "perfect" score for a rich, animated experience. By deferring expensive tasks (Spotify/Github feeds), we reduced the initial blocking time from **23s to 1.7s**. Users get a fast initial paint (Speed Index 3.26s), and the heavy lifting happens in the background.

We consciously traded a "perfect" score for a rich, animated experience. By deferring expensive tasks (Spotify/Github feeds), we reduced the initial blocking time from **23s to 1.7s**. Users get a fast initial paint (Speed Index 3.26s), and the heavy lifting happens in the background.

After the latest optimizations—deferred hydration (`8ceb44b`), aligned skeleton heights (`960da13`), and moving tech stack below the fold (`3816fbd`):

| Metric | Measured Value | Status |
| :--- | :--- | :--- |
| **LCP** | 3.76s | 🟡 Needs Improvement |
| **FCP** | 2.94s | 🟡 Needs Improvement |
| **TBT** | 1.71s | 🔴 Critical |
| **CLS** | 0.305 | 🔴 Critical |
| **TTI** | 8.17s | 🔴 Critical |
| **Speed Index** | 3.26s | 🟢 Good |

**Performance Score: 41/100**

### The "Score" vs. Reality

A 41/100 looks broken. The truth is more nuanced—we're effectively "cheating" the initial load by deferring work.

**The trade-off:**
1. **Speed Index (3.26s) is Good**: Users see content quickly. That's the primary goal for a blog.
2. **Deferred pain**: We didn't delete JavaScript execution time—we moved it out of the initial load window.
3. **The risk**: If a user interacts exactly when our heavy components wake up (around 3.5s), they might feel a stutter.

### The Real Win: TBT Reduction

We dropped Total Blocking Time from **23s to 1.7s**.

- **Before**: The browser was unresponsive for nearly 30 seconds
- **After**: Barely noticeable

Is 1.7s still "poor" by Google's standards (target `< 200ms`)? Yes. But unlike the 23s disaster, this is a conscious trade-off for a rich, animated personal site.

### With GitHub and Spotify APIs Disabled

This was a few hours of tinkering. I know the Spotify & GitHub feeds are the culprits, but I'd rather have personality than a perfect score.

```text title="web-vitals-results.txt"
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


## Measuring Going Forward

To keep an eye on this, I wrote a script that benchmarks the production build locally with Lighthouse CLI:

```bash title="measure-vitals.sh"
#!/bin/bash
# scripts/measure-vitals.sh
URL="${1:-http://localhost:3000}"
npx -y lighthouse "$URL" \
  --only-categories=performance \
  --chrome-flags="--headless"
```

The goal was never a perfect score—it was understanding what these metrics actually mean and making informed trade-offs. Mission accomplished.
