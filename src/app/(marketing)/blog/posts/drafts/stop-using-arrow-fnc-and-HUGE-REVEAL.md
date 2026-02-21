---
title: 'ARROW FUNCTIONS REVEALED'
publishedAt: '11-02-2026'
updatedAt: '11-02-2026'
summary: 'No clickbait here,  just the truth about arrow functions.', 'Yappin']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/stop-using-arrow-functions'
slug: 'stop-using-arrow-functions'
draft: false
---

Arrow functions are shorter right, return implicitely, and bind `this` automatically. 

True, but how often is that actually what you want? The amount of time I see this pattern makes my eyes bleed

```js
export const Foo = () => {
  return <Bar />
}
```

-
-
-
-
-
-
-
-
-
-
-
-
 

























## Reveal

Now for the big  reveal, going to be shocking

```js
export const Foo = () => {}
export function Foo() {}  
```
I know, crazy right? Aesthetic functions are shorter. 
