---
title: "Auditing Performance: Lessons from a Production Build"
date: "2025-12-31"
description: "A deep dive into how I audited my portfolio's performance, what metrics like LCP and TBT really mean, and the trade-offs of building a rich, personal site."
tags: ["Engineering", "Next.js", "Performance"]
---

The reason I'm writing this is because like most this part of front-end is often neglected and I wanted to dive into how blocking threads and certain code will affect loadtimes, or what metrics like LCP and TBT really mean. 

There is a lot more to performance than a lighthouse score. And for me personally I find a good UX with a snappy feeling site more important than having a 100/100 score but losing some personallity traits that make the site feel mine. That being said, I managed to get rid of some huge blockers and bring the score 
from 40~ to 90~/100. 

In the entierty of the process I used this script which can be ran simply via `./scripts/measure-vitals.sh <url>c. If you're going to test locally make sure to run your production build e.g. `npm run build && bun run preview | preview --port 4200&& ./scripts/measure-vitals.sh http://localhost:3000` and then run the script.

<details>
<summary>measure-vitals.sh</summary>

```bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <url>"
    exit 1
fi

URL="$1"

# Run Lighthouse
lighthouse "$URL" --chrome-flags="--headless --disable-gpu" --output=json --output-path=lighthouse-report.json

# Parse Lighthouse report
LCP=$(jq -r '.audits.' "$lighthouse-report.json")

# Print results
echo "LCP: $LCP"
echo "FCP: $FCP"
echo "TBT: $TBT"
echo "TTI: $TTI"
echo "Score: $Score"
```

</details>

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

Throughout this process I used a simple shell script to measure Web Vitals via Lighthouse. Run it against your production build for accurate results:

```bash title="measure-vitals.sh"
#!/bin/bash
set -e

URL="${1:-http://localhost:3000}"

spin() {
  local pid=$1 msg=$2
  local chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
  while kill -0 $pid 2>/dev/null; do
    for (( i=0; i<${#chars}; i++ )); do
      printf "\r  ${chars:$i:1} $msg"
      sleep 0.1
    done
  done
  printf "\r  ✓ $msg\n"
}

echo ""
echo "📊 Measuring Web Vitals"
echo "   $URL"
echo ""

printf "  ◦ Checking server..."
curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200\|301\|302" || { printf "\r  ✗ Cannot reach server\n"; exit 1; }
printf "\r  ✓ Server reachable\n"

npx -y lighthouse "$URL" \
  --only-categories=performance \
  --output=json \
  --output-path=/tmp/lighthouse-report.json \
  --chrome-flags="--headless --no-sandbox" \
  --quiet &
spin $! "Running Lighthouse audit..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

node -e "
const r = JSON.parse(require('fs').readFileSync('/tmp/lighthouse-report.json'));
const a = r.audits;
const fmt = (v, isTime) => isTime ? v.toFixed(2) + 's' : v.toFixed(3);
const status = (v, good, bad) => v <= good ? '🟢' : v <= bad ? '🟡' : '🔴';

const metrics = [
  ['LCP', a['largest-contentful-paint']?.numericValue / 1000, true, 2.5, 4],
  ['FCP', a['first-contentful-paint']?.numericValue / 1000, true, 1.8, 3],
  ['TBT', a['total-blocking-time']?.numericValue / 1000, true, 0.2, 0.6],
  ['CLS', a['cumulative-layout-shift']?.numericValue, false, 0.1, 0.25],
];

metrics.forEach(([name, val, isTime, good, bad]) => {
  if (val !== undefined) console.log('  ' + status(val, good, bad) + ' ' + name.padEnd(4) + fmt(val, isTime));
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Score: ' + Math.round(r.categories.performance.score * 100) + '/100');
"

rm -f /tmp/lighthouse-report.json
echo ""
```

Usage: `./scripts/measure-vitals.sh https://yoursite.com` (test against prod build with `pnpm build && pnpm start`).

I also used the **PerformanceObserver API** to pinpoint bottlenecks.

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
