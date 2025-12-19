```md
# PART 1: ENV + SETUP

Goal: env.ts, drizzle.config.ts, db connection, helpers, schema, test query from frontend.

We use Postgres Neon. I will set DATABASE_URL in .env myself.

## Create files

touch drizzle.config.ts

mkdir src/server/db
touch src/server/env.ts
touch src/server/db/connection.ts
touch src/server/db/schema.ts
touch src/server/db/helpers.ts

## Install packages

bun install @neondatabase/serverless
bun install drizzle-orm
bun install drizzle-kit -D
bun install @t3-oss/env-nextjs
bun add posthog-js

## Create src/server/env.ts

Variables required:

DATABASE_URL

BETTER_AUTH_URL  
BETTER_AUTH_SECRET  

GITHUB_CLIENT_ID  
GITHUB_CLIENT_SECRET  

ADMIN_EMAIL  

RESEND_API_KEY  
RESEND_EMAIL_FROM  

NEXT_PUBLIC_POSTHOG_KEY  
NEXT_PUBLIC_POSTHOG_HOST

Expected env.ts:

```ts
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    ADMIN_EMAIL: z.string().email().optional(),

    RESEND_API_KEY: z.string().optional(),
    RESEND_EMAIL_FROM: z.string().email().optional(),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

    ADMIN_EMAIL: process.env.ADMIN_EMAIL,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_EMAIL_FROM: process.env.RESEND_EMAIL_FROM,

    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  }
})
```

## Add tsconfig paths:

```json
{
 "compilerOptions": {
   "paths": {
     "env": ["./src/server/env.ts"],
     "db": ["./src/server/db/connection.ts"],
     "schema": ["./src/server/db/schema.ts"]
   }
 }
}
```

## Update env.example with all required variables.
Do not commit .env.

## Commit part 1

git checkout -b feature/server-env
git add .
git commit -m "env + paths + deps"
git push origin feature/server-env



# PART 2: DRIZZLE CONFIG

Create drizzle.config.ts containing:

```ts
import { env } from 'env'

export default {
  schema: './src/server/db/schema.ts',
  out: './src/server/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.DATABASE_URL
  }
}
```

Add package scripts:

```json
{
 "scripts": {
   "db:generate": "drizzle-kit generate",
   "db:push": "drizzle-kit push",
   "db:studio": "drizzle-kit studio"
 }
}
```

Commit

git add drizzle.config.ts package.json
git commit -m "add drizzle config + scripts"
git push



# PART 3: DATABASE CONNECTION

src/server/db/connection.ts:

```ts
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { env } from 'env'
import * as schema from 'schema'

const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })

export { schema }
```

Commit

git add src/server/db/connection.ts
git commit -m "db neon drizzle connection"
git push



# PART 4: HELPERS

src/server/db/helpers.ts:

```ts
import { text, timestamp, integer, boolean, real } from 'drizzle-orm/pg-core'

export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}

export const createdTimestamp = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
}

export const primaryId = {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
}

export const visitorId = {
  visitorId: text('visitor_id').notNull(),
}

export const optionalVisitorId = {
  visitorId: text('visitor_id'),
}

export const blogSlug = {
  slug: text('slug').notNull(),
}

export const viewCounters = {
  uniqueViews: integer('unique_views').default(0).notNull(),
  totalViews: integer('total_views').default(0).notNull(),
}

export const draftStatus = {
  isDraft: boolean('is_draft').default(false).notNull(),
}

export const engagementMetrics = {
  timeOnPage: integer('time_on_page'),
  scrollDepth: real('scroll_depth'),
  reachedEnd: boolean('reached_end').default(false).notNull(),
}

export const deviceType = {
  device: text('device').$type<'desktop' | 'mobile' | 'tablet'>(),
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet'
```

Commit

git add src/server/db/helpers.ts
git commit -m "helpers"
git push



# PART 5: SCHEMA

src/server/db/schema.ts:

```ts
import { pgTable, text, index, primaryKey, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import {
  primaryId,
  timestamps,
  createdTimestamp,
  visitorId,
  blogSlug,
  viewCounters,
  draftStatus,
  engagementMetrics,
  deviceType,
} from './helpers'

export const blogPosts = pgTable('blog_posts', {
  slug: text('slug').primaryKey(),
  ...viewCounters,
  ...draftStatus,
  ...timestamps,
}, (t) => [
  index('blog_posts_draft_idx').on(t.isDraft),
])

export const blogSessions = pgTable('blog_sessions', {
  ...primaryId,
  ...blogSlug,
  ...visitorId,
  ...engagementMetrics,
  ...deviceType,
  referrer: text('referrer'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
}, (t) => [
  index('blog_sessions_slug_idx').on(t.slug),
  index('blog_sessions_visitor_idx').on(t.visitorId),
])

export const blogLinkClicks = pgTable('blog_link_clicks', {
  ...primaryId,
  ...blogSlug,
  ...visitorId,
  sessionId: text('session_id').references(() => blogSessions.id, { onDelete: 'set null' }),
  linkHref: text('link_href').notNull(),
  linkText: text('link_text'),
  isInternal: boolean('is_internal').default(true).notNull(),
  clickedAt: timestamp('clicked_at').defaultNow().notNull(),
}, (t) => [
  index('blog_link_clicks_slug_idx').on(t.slug),
])

export const EMOJI_TYPES = ['fire','heart','clap','thinking','rocket'] as const
export type EmojiType = typeof EMOJI_TYPES[number]

export const blogReactions = pgTable('blog_reactions', {
  ...blogSlug,
  emoji: text('emoji').$type<EmojiType>().notNull(),
  ...visitorId,
  ...createdTimestamp,
}, (t) => [
  primaryKey({ columns: [t.slug, t.emoji, t.visitorId] }),
  index('blog_reactions_slug_idx').on(t.slug),
])

export type BlogPost = typeof blogPosts.$inferSelect
export type BlogSession = typeof blogSessions.$inferSelect
export type BlogLinkClick = typeof blogLinkClicks.$inferSelect
export type BlogReaction = typeof blogReactions.$inferSelect
```

Commit

git add src/server/db/schema.ts
git commit -m "schema"
git push



# PART 6: TEST QUERY

Create server action in app/page.tsx:

```ts
'use server'
import { db } from 'db'
import { blogPosts } from 'schema'

export async function countPosts() {
  const result = await db.select().from(blogPosts)
  return result.length
}
```

Then call from frontend:

```ts
const count = await countPosts()

return <pre>{count}</pre>
```

Test page loads without error and prints a number.

Commit final part.

git add .
git commit -m "test query working"
git push
```
