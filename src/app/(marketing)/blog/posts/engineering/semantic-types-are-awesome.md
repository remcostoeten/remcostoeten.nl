---
title: 'Scalability #1: Semantic types are awesome'
publishedAt: '11/02/2026'
updatedAt: '11/02/2026'
summary: 'A beautiful way of writing types for maintainable code.'
tags: ['Architecture','TypeScript', 'Engineering']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/engineering/semantic-types-are-awesome'
slug: 'semantic-types-are-awesome'
draft: false
---

When I worked at [Brainstud](https://brainstud.nl) I was introduced to a type strategy which I'll refer to as "semantic typing". Essentially you create types that represent the semantics of that value, not just its primitive shape. This comes in handy when working in a team or on a large codebase.

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
export type Time = string
export type Email = string
export type URL = string
export type Markdown = string
```

Then create a `base.types.ts` to avoid redefining shapes over and over:

```ts
import { ID, Time } from './semantics'

export type Timestamps = {
 createdAt: Time
 updatedAt: Time
}

export type Entity = {
 id: ID
} & Timestamps
```

This ensures consistency. We're almost certain that every persisted object will (or should) have an `id`, `createdAt`, and `updatedAt`.

This might seem like overengineering, but it greatly reduces onboarding time and discrepancies. It prevents the "Wait, is usage time in milliseconds (number) or an ISO string?" questions months down the line.

## A Full Domain Example

This is the frontend part of the implementation. For the backend I use a similar strategy which you can read in [Part two: Scalable Drizzle ORM setup](/blog/engineering/scalable-drizzle-orm-setup).

I'll be showcasing the code I have running in production for [Skriuw](https://skriuw.vercel.app). The source for [semantics](https://github.com/remcostoeten/skriuw/blob/daddy/packages/shared/src/types/semantics.ts) and [base](https://github.com/remcostoeten/skriuw/blob/daddy/packages/shared/src/types/base.ts) types lives in the shared package.

In my domain logic for creating notes, utilizing the base types yields this:

```ts
export type Note = BaseEntity & {
 name: string
 content: NoteContent
 icon?: string
 coverImage?: string
 tags?: string[]
 parentFolderId?: UUID
 pinned?: boolean
 pinnedAt?: Timestamp
 favorite?: boolean
 isPublic?: boolean
 publicId?: string | null
 userId?: UUID
 type: 'note'
}
```

TypeScript ensures the `Note` type automatically inherits `id`, `createdAt`, and `updatedAt` via the intersection.

Building on this, domain models become self documenting:

```ts
import { Entity } from './base'
import { ID, Email, URL, Markdown, Time } from './semantics'

export type User = Entity & {
 username: string
 email: Email
 avatarUrl?: URL
 bio?: string
 role: 'admin' | 'author' | 'reader'
}

export type Post = Entity & {
 authorId: ID
 title: string
 slug: string
 content: Markdown
 published: boolean
 publishedAt?: Time
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

1. **Refactoring is trivial**: If you decide to switch your IDs from `string` UUIDs to `number` auto increments, you change it in **one place** (`types/semantics.ts`), and it propagates everywhere.
2. **Intent is clear**: When you see `content: Markdown` versus `content: string`, you immediately know you shouldn't render it directly without sanitization or parsing.
3. **Cross referencing**: `authorId: ID` tells you exactly what kind of value is expected there, matching the `id` field of the `User` entity.

You can even go a step further with **Branded Types** (or "Opaque Types") if you want to ensure you never accidentally pass a `PostId` into a function expecting a `UserId`.

## The Generic Data Access Layer

The real power of semantic typing shines when combined with a generic data access layer. Instead of writing a specific function to create a Note, and another to create a Tag, you write a single generic `create` function.

By using a generic constraint like `T extends BaseEntity`, you tell TypeScript: "I don't care what specific object this is—whether it's a Note, a User, or a settings config—as long as it adheres to my Base Entity semantics."

```ts
export async function create<T extends BaseEntity>(
 storageKey: string,
 data: CreateInput<T>,
 options?: CreateOptions<T>
): Promise<CrudResult<T>> {
 // logic that safely accesses .id, .createdAt because it KNOWS T has them
}
```

This ensures that your data layer is practically self documenting and foolproof. It is impossible to accidentally pass an object that doesn't have an ID or timestamp to your database layer. The compiler simply won't allow it.

By defining your semantics upfront—what an ID is, what a timestamp is, and what an Entity must look like—you stop writing defensive code to check if properties exist, and start writing domain logic that just works.
