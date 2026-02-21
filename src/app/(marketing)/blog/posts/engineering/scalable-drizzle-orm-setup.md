---
title: 'Scalable Drizzle ORM Setup'
publishedAt: '2026-02-16'
updatedAt: '2026-02-16'
summary: 'Learn how to integrate semantic types with Drizzle ORM for better type safety and developer experience.'
tags: ['TypeScript', 'Drizzle ORM', 'Engineering']
author: 'Remco Stoeten'
canonicalUrl: 'https://remcostoeten.nl/blog/engineering/scalable-drizzle-orm-setup'
slug: 'scalable-drizzle-orm-setup'
draft: false, 
---

In my previous article regarding [Semantic Types](/blog/engineering/semantic-types-are-awesome), I discussed the power of semantic types for improved code clarity and maintenance. Now, let's explore how to apply this pattern to your database layer using Drizzle ORM.

## The Problem

The problem with basic TypeScript types like `string`, `boolean`, and `number` is that they don't tell the full story. When you see a string parameter, you don't know if it's an email, a UUID, a timestamp, or just any old text. This becomes especially problematic as teams grow and codebases scale.

Instead of using generic types like:

```ts
type ID = string | number
```

We can create semantic types that clearly express intent:

```ts
export type UUID = string
export type Time = string
```

This simple change makes code self-documenting and prevents common mistakes.

## Semantic Types

The beauty of this approach is its simplicity. We're not creating complex type hierarchies or fancy abstractions—just clear, semantic names for common patterns.

Every database record typically needs an ID and timestamps. Instead of repeating this pattern everywhere, we can create reusable base types:

```ts
import type { Time, UUID } from "./base"

export type Timestamps = {
	createdAt: Time
	updatedAt: Time
	deletedAt?: Time
}

export type BaseEntity = {
	id: UUID
} & Timestamps
```

Use them in your entities:

```ts
export type Post = BaseEntity & {
	title: string
	content: string
	authorId: UUID
}
```

This approach provides better type safety and consistency across your application.

## Drizzle ORM Schema Design

This semantic typing approach isn't tied to any specific framework—I've used it with Hono.js, Next.js server functions, and Drizzle ORM. The real magic happens when you apply this pattern to your database schemas.

Instead of manually defining the same timestamp and ID fields in every table, we can extract them into reusable helpers.

First, let's create a helper for timestamps. This handles `createdAt`, `updatedAt`, and optionally `deletedAt` for soft deletes. We also ensure they are properly typed as our semantic `Time` type:

```ts
import { timestamp } from "drizzle-orm/pg-core"
import type { Time } from "@/api/types/base"

export function timestampsSchema(opts?: { withDeleted?: boolean }) {
	return {
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$type<Time>(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$type<Time>(),
		// Dynamically add deletedAt only if withDeleted is true
		...(opts?.withDeleted
			? { deletedAt: timestamp("deleted_at", { withTimezone: true }).$type<Time>() }
			: {}),
	}
}
```

The interesting part here is the spread operator `...`. We are conditionally adding the `deletedAt` column to the schema object.

If `opts.withDeleted` is true, the ternary returns an object containing `{ deletedAt: ... }`, which gets spread into the main object.
If it's false or undefined, it returns `{}` (an empty object), which spreads nothing.

This allows us to opt-in to soft deletes on a per-table basis without rewriting the schema definition.

Now we can combine this with a UUID primary key to create our `baseEntitySchema`. This ensures every table using this schema has a consistent ID and timestamp structure:

```ts
import { uuid } from "drizzle-orm/pg-core"
import type { UUID } from "@/api/types/base"

export function baseEntitySchema(opts?: { withDeleted?: boolean }) {
	return {
		id: uuid("id").primaryKey().defaultRandom().$type<UUID>(),
		...timestampsSchema(opts),
	}
}
    
```

Use them in your table definitions:
  
```ts
import { pgTable, text, boolean } from "drizzle-orm/pg-core"
import { baseEntitySchema } from "./schema-helpers/base"

export const posts = pgTable("posts", {
	...baseEntitySchema({ withDeleted: true }),
	content: text("content").notNull(),
	published: boolean("published").notNull().default(false),
})
```

## Using this in pratice

In my earlier article I promoted the usag of a DAL This here is a bit less abstracted version tailored for the posts domain preventing any leakage of the db on the client.

```ts
export async function createPost(data: Post): Promise<Post> {
	const [post] = await db.insert(posts).values(data).returning()
	return post
}

export async function getPostsByAuthor(authorId: UUID): Promise<Post[]> {
	return await db.select().from(posts).where(eq(posts.authorId, authorId))
}
```

Pure functions done for handling database access. Now time for the client. Creating a server function and validating it with Zod.

```ts
"use server"

import { z } from "zod"
import { createPost } from "@/api/posts" // The pure function we just wrote

const createPostSchema = z.object({
	title: z.string().min(1),
	content: z.string().min(1),
	authorId: z.string().uuid()
})

export async function createPostAction(formData: FormData) {
	const parsed = createPostSchema.safeParse({
		title: formData.get("title"),
		content: formData.get("content"),
		authorId: formData.get("authorId")
	})

	if (!parsed.success) {
		return { error: "Invalid input" }
	}

	await createPost(parsed.data)
	return { success: true }
}
```

This pattern keeps your database logic pure and separation of concerns intact. Your API layer handles the data access, and your Server Actions handle the validation and client communication.

By establishing these semantic foundations early, you build a system that is robust, self-documenting, and easy to scale.

