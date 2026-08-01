---
title: 'JavaScript biggest secret'
publishedAt: '11-02-2026'
updatedAt: '30-06-2026'
summary: 'Only ELITE engineers know this secret.'
tags: ['Engineering', 'Personal']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/stop-using-arrow-functions'
slug: 'stop-using-arrow-functions'
draft: false
---

For anyone <small><i>or your ai ;)</i></small> writing arrow functions like this:

```typescript
export const SomeView = () => {
 return ()
}
```

Please stop.

Watch this:

```typescript
export const SomeView = () => {
 return () => {}
export function SomeView() {
 return () => {}
f`
You see which has fewer characters!? Crazy right?

On top of that hosting rocks. Please stop returning your arrow functions.


