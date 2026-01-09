---
title: "Auditing Performance: Lessons from a Production Build"
date: "2025-12-31"
description: "A deep dive into how I audited my portfolio's performance, what metrics like LCP and TBT really mean, and the trade-offs of building a rich, personal site."
tags: ["Engineering", "Next.js", "Performance"]
---

Performance and accessibility are often overlooked. With my site 90% ready, I ran a final audit expecting minor tweaks. Instead, I found significant issues.

## The Baseline (Before Optimization)

My local build looked fine, but the production deployment on Vercel told a different story.

| Metric                             | Measured Value | Status            |
| :--------------------------------- | :------------- | :---------------- |
| **LCP** (Largest Contentful Paint) | 3.95s          | Needs Improvement |
| **FCP** (First Contentful Paint)   | 2.85s          | Needs Improvement |
| **TBT** (Total Blocking Time)      | **23.19s**     | Critical          |
| **TTI** (Time to Interactive)      | 33.42s         | Critical          |
| **Score**                          | **43/100**     | Critical          |

I had a serious main-thread blocking issue.

## The Methodology

I used the **PerformanceObserver API** to pinpoint bottlenecks.

LCP (2.36s) was triggered by text in the Tech Stack section. TTFB (1.79s) was high, likely due to eager SSR and API latency. TBT (8.42s locally / 23s prod) was the critical bottleneck, with heavy hydration and animations blocking user input.

Cumulative Layout Shift (CLS) was 0.109, which is mostly stable, but ideally should be below 0.1.

## The Solutions

The audit revealed three culprits: **massive bundles**, **eager API polling**, and **unnecessary server-side rendering**.

### 1. Dynamic Imports (Code Splitting)

The `ActivitySection` was massive, containing over 700 lines with heavy `framer-motion` animations. By default, Next.js bundles everything together, so the browser has to download and parse it all before anything becomes interactive.

**The Fix:** Use `next/dynamic` to lazy-load heavy components into separate chunks.

```tsx title="dynamic-import.tsx"
const ActivitySection = nextDynamic(
  () => import('@/components/landing/activity/section').then(m => ({ default: m.ActivitySection })),
  { loading: () => <ActivitySkeleton /> }
);
```

### 2. Deferring Execution (Unblocking Main Thread)

The 23s TBT was caused by a `useEffect` hook that started polling the Spotify API *immediately* on hydration.

**The Fix:** Wrap the start logic in a 3-second timeout, giving the browser time to finish hydration first.

```typescript title="deferred-execution.ts"
useEffect(() => {
  // Wait 3s to let hydration finish
  const timer = setTimeout(() => {
    startHeavyPolling();
  }, 3000);
  return () => clearTimeout(timer);
}, []);
```

### 3. Caching Strategy (ISR)

Almost every page had `export const dynamic = 'force-dynamic'`, forcing the server to regenerate HTML for every request.

**The Fix:** Switch to **Incremental Static Regeneration (ISR)** to cache pages at the edge.

```typescript title="isr-config.ts"
export const revalidate = 60 // regenerate at most once per minute
```

## The "Fix" That Broke Things

Optimizations often have trade-offs.

| Metric  | Post-Fix Value | Status                    |
| :------ | :------------- | :------------------------ |
| **TBT** | 14.13s         | Improved                  |
| **CLS** | **0.632**      | **CRITICAL REGRESSION** 🔴 |

We traded one problem for another. Lazy loading components with `loading: () => null` caused massive layout shifts (CLS) when content loaded.

**The Fix:** Precise skeletons. I built skeletons that matched the *exact* dimensions of the loaded components (e.g., specific graph heights and card grids). Precision is key to avoiding CLS.

## Final Results

After refining skeletons and further deferring non-essential scripts:

| Metric          | Value     | Status                     |
| :-------------- | :-------- | :------------------------- |
| **LCP**         | 4.57s     | Acceptable                 |
| **CLS**         | **0.065** | **Fixed** 🟢                |
| **TBT**         | **1.71s** | **Massive Win** (from 23s) |
| **Speed Index** | 3.26s     | **Good** 🟢                 |

**Performance Score: 41/100.** This low score is misleading.

We consciously traded a "perfect" score for a rich, animated experience. By deferring expensive tasks (Spotify/Github feeds), we reduced the initial blocking time from **23s to 1.7s**. Users get a fast initial paint (Speed Index 3.26s), and the heavy lifting happens in the background.

With those heavy integrations disabled, the site hits **89/100**, proving the core architecture is sound. The remaining "cost" is a deliberate design choice.

## Conclusion

Performance isn't just about chasing a 100/100 Lighthouse score. It is about understanding metrics and making intentional trade-offs. We successfully unblocked the main thread and severely reduced wait times, prioritizing the user's perception of speed over a raw metric.
