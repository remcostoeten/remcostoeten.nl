---
title: 'Measuring Postgres Search Indexes Before and After'
publishedAt: '2026-06-06'
updatedAt: '2026-06-06'
summary: 'A small real-world benchmark from a WhatsApp history app: adding trigram indexes turned broad message searches from parallel sequential scans into bitmap index scans, cutting queries from hundreds of milliseconds to single digits.'
tags: ['PostgreSQL', 'Performance', 'Indexes', 'Engineering']
author: 'Remco Stoeten'
slug: 'measuring-postgres-search-indexes-before-and-after'
draft: false
---

I had one of those moments where an AI assistant gave technically plausible database advice, but some of it was too generic to trust directly.

The schema in question was a WhatsApp history app. The `messages` table had around 932k rows, and the assistant suggested a mix of things: partition the table, normalize a few small lookup values, remove denormalized `last_message` fields, add indexes, maybe add caching.

Some of that sounded reasonable at first glance. Most of it was not the first move.

## The Actual Problem

The slow path was not the shape of the whole schema. It was substring search over message text.

The app has queries like this:

```sql
SELECT id, chat_id, message, timestamp
FROM public.messages
WHERE message ILIKE '%photo%'
ORDER BY timestamp DESC
LIMIT 50;
```

Without the right index, Postgres has no cheap way to answer `ILIKE '%term%'`. A normal btree index is not useful for that pattern because the wildcard is at the start of the string.

So the baseline query plan looked like this:

```text
Parallel Seq Scan on messages
Execution Time: 313.753 ms
```

For another term it was worse:

```text
Parallel Seq Scan on messages
Execution Time: 827.190 ms
```

That is exactly the kind of thing that feels fine during development and then gets annoying once the dataset becomes real.

## The Fix

Postgres has a good tool for this: `pg_trgm`.

I added trigram indexes for the columns used by fuzzy and substring search:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_messages_message_trgm
ON public.messages USING gin (message gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_chats_name_trgm
ON public.chats USING gin (name gin_trgm_ops);

ANALYZE public.messages;
ANALYZE public.chats;
```

The important part is not just creating indexes. The important part is measuring before and after with the same query shape.

## The Result

| Term     |       Before |       After |      Change |
| -------- | -----------: | ----------: | ----------: |
| `http`   | `827.190 ms` | `21.621 ms` | ~38x faster |
| `photo`  | `313.753 ms` |  `4.566 ms` | ~69x faster |
| `thanks` | `327.628 ms` |  `4.210 ms` | ~78x faster |
| `test`   | `323.533 ms` |  `5.479 ms` | ~59x faster |

The post-index plan changed to this:

```text
Bitmap Index Scan on idx_messages_message_trgm
Bitmap Heap Scan on messages
Execution Time: 4.566 ms
```

That is the difference I wanted to see. Not just a new index existing in `pg_indexes`, but the planner actually choosing it.

## Why I Did Not Partition the Table

The assistant also suggested partitioning `messages` by date or chat ID.

That is not wrong in every context, but it is the wrong first move here.

Around one million rows is not scary for Postgres. Partitioning adds operational complexity: import paths, constraints, query planning behavior, migrations, and future maintenance all get more complicated. If the slow query is a text search that cannot use an index, partitioning is mostly avoiding the real issue.

The better order is:

1. Measure the real query.
2. Check the plan.
3. Add the smallest index that matches the access pattern.
4. Re-run the same benchmark.
5. Only reach for heavier schema changes if the measured result is still not good enough.

## The Takeaway

Generic schema advice is cheap. Query plans are evidence.

In this case the fix was not a rewrite, a cache, a message queue, or table partitioning. It was one missing trigram index on the column people actually search.

The part worth keeping is the workflow:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, chat_id, message, timestamp
FROM public.messages
WHERE message ILIKE '%photo%'
ORDER BY timestamp DESC
LIMIT 50;
```

Run that before. Run it after. Store the result.

If the plan changes from `Seq Scan` to `Bitmap Index Scan`, and the execution time drops from hundreds of milliseconds to single digits, you have a real performance fix instead of a theoretical one.
