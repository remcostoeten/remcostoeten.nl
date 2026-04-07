---
title: 'Scalability #1: Semantic types are awesome'
publishedAt: '11/02/2026'
updatedAt: '11/02/2026'
summary: 'A beautiful way of writing types for maintainable code.'
tags: ['Architecture', 'TypeScript', 'Engineering']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/engineering/semantic-types-are-awesome'
slug: 'semantic-types-are-awesome'
draft: false
---

When I worked at [Brainstud](https://brainstud.nl) I was introduced to a type strategy which I'll refer to as "semantic typing". Essentially you create types that represent the semantics of that value, not just its primitive shape. This comes in handy when working in a team or on a large codebase.

:::note
Type aliases like `type ID = string` are purely semantic and interchangeable at compile time. If you need to prevent mixing values like `UserId` and `PostId`, you can use branded types. This will be covered in a later article.
:::

It's up to you how far you take this. The idea is to make it clear what the value actually _is_, since an `id` can be a string or integer, and a timestamp can be a number or a string.

Instead of having generic types like so:

```ts
type Post = {
	id: string | number
	content: string
	createdAt: number | string
	updatedAt: number | string
}
```

You define explicit semantics:

```ts
export type ID = string
export type Timestamp = string
```

Then create a `base.types.ts` to avoid redefining shapes over and over:

```ts
import { ID, Timestamp } from './semantics'

export type Timestamps = {
	createdAt: Timestamp
	updatedAt: Timestamp
}

export type Entity = {
	id: ID
} & Timestamps
```

This ensures consistency. We're almost certain that every persisted object will (or should) have an `id`, `createdAt`, and `updatedAt`.
In the drizzle article I cover optionally `deletedAt` usage.

This might seem like overengineering, but it greatly reduces onboarding time and discrepancies. It prevents the "Wait, is usage time in milliseconds (number) or an ISO string?" questions months down the line. And not only that, it sets guidelines to follow instead of free-for-all.

## A Full Domain Example

This is the frontend part of the implementation. For the backend I use a similar strategy which you can read in [Part two: Scalable Drizzle ORM setup](/blog/engineering/scalable-drizzle-orm-setup).

I'll be showcasing the code I have running in production for [Skriuw](https://skriuw.vercel.app). The source for [semantics](https://github.com/remcostoeten/skriuw/blob/daddy/packages/shared/src/types/semantics.ts) and [base](https://github.com/remcostoeten/skriuw/blob/daddy/packages/shared/src/types/base.ts) types lives in the shared package.

In my domain logic for creating notes, utilizing the base types yields this:

```ts
export type Note = Entity & {
	name: string
	content: string
	icon?: string
	coverImage?: string
	tags?: string[]
	parentFolderId?: ID
	pinned?: boolean
	pinnedAt?: Timestamp
	favorite?: boolean
	isPublic?: boolean
	publicId?: string | null
	userId?: ID
	type: 'note'
}
```

TypeScript ensures the `Note` type automatically inherits `id`, `createdAt`, and `updatedAt` via the intersection.

Building on this, domain models become self documenting:

```ts
import { Entity } from './base'
import { ID, Timestamp } from './semantics'

export type User = Entity & {
	username: string
	email: string
	avatarUrl?: string
	bio?: string
	role: 'admin' | 'author' | 'reader'
}

export type Post = Entity & {
	authorId: ID
	title: string
	slug: string
	content: string
	published: boolean
	publishedAt?: Timestamp
	tags: string[]
}

export type Comment = Entity & {
	postId: ID
	authorId: ID
	content: string
	parentId?: ID
}
```

### Why is this better?

1. **Refactoring is trivial at the type level**: If you decide to switch your IDs from `string` UUIDs to `number` auto increments, you change it in one place (`types/semantics.ts`), and it propagates everywhere.
2. **Intent is clear**: When you see `content: string` versus a more specific semantic type, you know how it should be treated.
3. **Cross referencing**: `authorId: ID` tells you exactly what kind of value is expected there, matching the `id` field of the `User` entity.

## The Generic Data Access Layer

The real power of semantic typing shines when combined with a generic data access layer. Instead of writing a specific function to create a Note, and another to create a Tag, you write a single generic `create` function.

By using a generic constraint like `T extends Entity`, you tell TypeScript: "I don't care what specific object this is, whether it's a Note, a User, or a settings config, as long as it adheres to my base entity semantics."

```ts
export async function create<T extends Entity>(
	storageKey: string,
	data: T
): Promise<T> {
	// implementation
}
```

This ensures that your data layer is predictable and consistent. It is impossible to accidentally pass an object that does not have an ID or timestamps to your database layer, the compiler will not allow it.

By defining your semantics upfront, what an ID is, what a timestamp is, and what an Entity must look like, you stop writing defensive code to check if properties exist, and start writing domain logic that just works.
