import { pgTable, text, timestamp, integer, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const blogViews = pgTable('blog_views', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  sessionId: text('session_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
}, (table) => ({
  // Unique constraint to prevent duplicate views from same session for same post
  uniqueSessionSlug: unique().on(table.sessionId, table.slug),
}));

export const blogViewsIndexes = {
  slug: 'idx_blog_views_slug',
  sessionId: 'idx_blog_views_session_id',
  timestamp: 'idx_blog_views_timestamp',
  createdAt: 'idx_blog_views_created_at',
};