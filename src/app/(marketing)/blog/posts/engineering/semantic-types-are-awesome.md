---
title: 'Semantic types are awesome'
publishedAt: '11-02-2026'
updatedAt: '11-02-2026'
summary: 'A beautiful way of writing types for maintainable code.'
tags: ['TypeScript', 'Engineering']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/engineering/semantic-types-are-awesome'
slug: 'semantic-types-are-awesome'
draft: true
---

TypeScript is an incredibly powerful tool for ensuring code correctness, but its built-in primitives (`string`, `number`, `boolean`) often fail to capture the _intent_ of the data. Determining whether a `string` variable holds a UUID, an email address, or raw HTML often requires guessing or digging through documentation.

This ambiguity can lead to subtle bugs—like passing a User ID to a function expecting a Post ID—that the compiler won't catch because, technically, they are both just strings.

When I worked at [Brainstud](https://brainstud.nl) I was introduced to a type strategy which I'll refer to as "semantic typing". Essentially you create types that represent the semantics of that value, not just its primitive shape. This comes in handy when working in a team or on a large codebase.

It's up to you how far you take this. The idea is to make it clear what the value actually _is_, since an `id` can be a string or integer, and a timestamp can be a number or a string.

Instead of having generic types like so:

```ts
type Post = {
	id: string | number // will most likely always be string but u get the point
	content: string
	createdAt: number | string
	updatedAt: number | string
}
```

You define explicit semantics:

```ts
export type ID = string // or whatever your back-end uses
export type Time = string // ISO-8601 string, for example
```

In an attempt to keep the codebase clean and not have to redefine shapes over and over again, I'll create a `base.types.ts` file which will contain the base types.

```ts
import { Time, ID } from './semantics.types'

export type Timestamps = {
	createdAt: Time
	updatedAt: Time
}

export type Entity = {
	id: ID
} & Timestamps
```

This ensures consistency. We're almost certain that every persisted object will (or should) have an `id`, `createdAt`, and `updatedAt`.

This might seem like over-engineering, but it greatly reduces onboarding time and discrepancies. It prevents the "Wait, is usage time in milliseconds (number) or an ISO string?" questions months down the line.

## A Full Domain Example
This is the front-end part of the implementation. For the back-end I use a similair strategy which you can read in [Part two - Scalable Drizzle ORM setup](/blog/engineering/scalable-drizzle-orm-setup).

I'll be showcasing the code I have running in production for [Skriuw](https://skriuw.vercel.app).

No DRY explanation here, but for those curious. [semantics](https://github.com/remcostoeten/skriuw/blob/daddy/packages/shared/src/types/semantics.ts) and [base](https://github.com/remcostoetew11n/skriuw/blob/daddy/packages/shared/src/types/base.ts) contain the types we just discussed. In case of Skriuw the back-end is written in Node utilizing Drizzle and Rust but we're showcasing the BFF (Backend For Frontend) implementation.

In my domain logic for creating notes we need a type that represents the data we expect to receive. Utilizing the base types will yield in this:

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
// ID === UUID
```

TypeScript ensures the `Note` type automatically inherits `id`, `createdAt`, and `updatedAt` via the intersection. Source here: [BaseEntity](https://github.com/remcostoeten/skriuw/blob/daddy/packages/shared/src/types/base.ts).

This doe

are the files I'm using. I'm using [Drizzle ORM](https://drizzle.orm.com) with [PostgreSQL](https://postgresql.org) as the database.

First, we define our semantic primitives to make our intent clear.

```ts
// types/semantics.ts
export type ID = string
export type Time = string
export type Email = string
export type URL = string
export type Markdown = string
```

Next, our base entity structure:

```ts
// types/base.ts
import { ID, Time } from './semantics'

export type Timestamps = {
	createdAt: Time
	updatedAt: Time
}

export type Entity = {
	id: ID
} & Timestamps
```

Now, we can build our domain model. Notice how self-documenting the code becomes.

```ts
// types/domain.ts
import { Entity, Email, URL, Markdown } from '.
base';

export type User = Entity & {
	username: string;
	email: Email;
	avatarUrl?: URL;
	bio?: string;
	role: 'admin' | 'author' | 'reader';
};

export type Post = Entity & {
	authorId: ID; // Explicit reference
	title: string;
	slug: string;
	content: Markdown;
	published: boolean;
	publishedAt?: Time;
	tags: string[];
};

export type Comment = Entity & {
	postId: ID;
	authorId: ID;
	content: string; // Plain text, not Markdown
	parentId?: ID; // For nested comments
};
```

### Why is this better?

1.  **Refactoring is trivial**: If you decide to switch your IDs from `string` UUIDs to `number` auto-increments, you change it in **one place** (`types/semantics.ts`), and it propagates everywhere.
2.  **Intent is clear**: When you see `content: Markdown` versus `content: string`, you immediately know you shouldn't render it directly without sanitization or parsing.
3.  **Cross-referencing**: `authorId: ID` tells you exactly what kind of value is expected there, matching the `id` field of the `User` entity.

You can even go a step further with **Branded Types** (or "Opaque Types") if you want to ensure you never accidentally pass a `PostId` into a function expecting a `UserId`.

## The Generic Data Access Layer

The files `create.ts`, `read.ts`, `update.ts`, etc., act as a Generic Data Access Layer.

Their purpose is to write the logic for handling data once and reuse it for every single data type (Notes, Tags, Users) without rewriting code. Because you enforce `T extends BaseEntity`, these files can safely assume that whatever you pass to them will have an `ID`, `createdAt`, and `updatedAt`.

In the app I'm using as an example (Skriuw), I have a core CRUD layer consisting of operations like `create`, `read`, `update`, and `destroy`.

This does the heavy lifting for the entire application. Instead of writing a specific function to create a Note, and another to create a Tag, I possess a single generic `create` function.

This is where the power of semantic typing truly shines. By using a generic constraint like `T extends BaseEntity`, I can tell TypeScript: "I don't care what specific object this is—whether it's a Note, a User, or a settings config—as long as it adheres to my Base Entity semantics."

```ts
// packages/crud/src/operations/create.ts
export async function create<T extends BaseEntity>(
	storageKey: string,
	data: CreateInput<T>,
	options?: CreateOptions<T>
): Promise<CrudResult<T>> {	
	// ... logic that safely accesses .id, .createdAt because it KNOWS T has them
}
```

This ensures that my "Backend For Frontend" is practically self-documenting and foolproof. It is impossible to accidentally pass an object that doesn't have an ID or timestamp to my database layer. The compiler simply won't allow it.

By defining your semantics upfront—what an ID is, what a timestamp is, and what an Entity must look like—you stop writing defensive code to check if properties exist, and start writing domain logic that just works.
