---
title: 'STOP USING ARROW FUNCTIONS'
publishedAt: '11-02-2026'
updatedAt: '11-02-2026'
summary: 'Arrow functions are convenient. That does not make them good architecture.'
tags: ['JavaScript', 'Engineering', 'Yappin']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/stop-using-arrow-functions'
slug: 'stop-using-arrow-functions'
draft: true
---

Arrow functions are convenient.

That’s it. That’s the whole pitch.

They aren’t hoisted.  
They don’t have stable names.  
They can’t be overloaded.  
They don’t participate in prototypes.  
They replace immutable symbols with mutable variables.

Yet somehow they became the default.

And then I see this:

```js
export const Foo = () => {
  return <Bar />
}
```

Why.

Compare:

```js
function Foo() {
  return <Bar />
}

const Foo = () => {
  return <Bar />
}
```

Same JSX.

Different semantics.

The first is a hoisted, named function declaration.

The second is a variable holding an anonymous closure.

“But arrows bind `this` automatically.”

Exactly. Hidden behavior.

Great for callbacks.

Bad for architecture.

Arrow functions optimize for keystrokes.

Function declarations optimize for systems.

If your codebase is bigger than a toy project, stop pretending they’re interchangeable.
