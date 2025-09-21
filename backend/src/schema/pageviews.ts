import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const pageviews = pgTable('pageviews', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  title: text('title'),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

export const pageviewsIndexes = {
  url: 'idx_pageviews_url',
  timestamp: 'idx_pageviews_timestamp',
  createdAt: 'idx_pageviews_created_at',
};


