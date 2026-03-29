---
title: 'JavaScript biggest secret'
publishedAt: '11-02-2026'
updatedAt: '11-02-2026'
summary: 'Only ELITE engineers know this secret.'
tags: ['Engineering', 'Personal']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/stop-using-arrow-functions'
slug: 'stop-using-arrow-functions'
---

Arrow functions were revolutionary. Very slick. Very modern. Also wildly overused. This agonizing example is something I see way to often.

```js
export const SomeView = () => {
	return (
		<section>
			<h1>Invoices</h1>
			<p>We turned a normal function into branding.</p>
		</section>
	)
}
```

Nice. Clean. Contemporary. Completely unnecessary.S

## Nice Example

This is where it gets annoying:

```js
export const SomeView = () => {
	return <button onClick={() => console.log('clicked')}>Create invoice</button>
}

export const calculateTotal = (items) => {
	return items.reduce((sum, item) => sum + item.price, 0)
}
```

`onClick` is fine. That arrow function has a job.

That `return items.reduce(...)` is also fine.

The boilerplate around the exported component and utility is the part that is pointless.

Write this instead:

```js
export function SomeView() {
	return (
		<section>
			<h1>Invoices</h1>
			<button onClick={() => console.log('clicked')}>Create invoice</button>
		</section>
	)
}

export function calculateTotal(items) {
	return items.reduce((sum, item) => sum + item.price, 0)
}
```

Same behavior. Less nonsense.

## The Huge Reveal

Ready for the huge reveal? Two lines. You wont believe your eyes!

```js
export const Foo = () => {}
export function Foo() {}
```
Arrow constants ARE longer. Shocking, I know.

Besides that you  will benefit from hoisting yadadada when using good old functional syntax.
