import { pgTable, text, timestamp, integer, uniqueIndex, index, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const blogFeedback = pgTable('blog_feedback', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  slug: text('slug').notNull(),
  emoji: varchar('emoji', { length: 10 }).notNull(),
  message: text('message'),
  url: text('url'),
  userAgent: text('user_agent'),
  ipHash: varchar('ip_hash', { length: 64 }),
  fingerprint: varchar('fingerprint', { length: 64 }),
  timestamp: timestamp('timestamp', { mode: 'string' }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('blog_feedback_slug_idx').on(table.slug),
  timestampIdx: index('blog_feedback_timestamp_idx').on(table.timestamp),
  emojiIdx: index('blog_feedback_emoji_idx').on(table.emoji),
  fingerprintIdx: index('blog_feedback_fingerprint_idx').on(table.fingerprint),
}));

export const blogFeedbackRelations = relations(blogFeedback, ({ one }) => ({
  // Relations can be added here if needed
}));

export type TBlogFeedback = typeof blogFeedback.$inferSelect;
export type TNewBlogFeedback = typeof blogFeedback.$inferInsert;