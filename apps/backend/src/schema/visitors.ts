import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const visitors = pgTable('visitors', {
  id: text('id').primaryKey(),
  visitorId: text('visitor_id').notNull().unique(),
  isNewVisitor: boolean('is_new_visitor').notNull().default(true),
  firstVisitAt: timestamp('first_visit_at', { withTimezone: true }).notNull(),
  lastVisitAt: timestamp('last_visit_at', { withTimezone: true }).notNull(),
  totalVisits: integer('total_visits').notNull().default(1),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

export const blogViews = pgTable('blog_views', {
  id: text('id').primaryKey(),
  visitorId: text('visitor_id').notNull(),
  blogSlug: text('blog_slug').notNull(),
  blogTitle: text('blog_title').notNull(),
  viewCount: integer('view_count').notNull().default(1),
  firstViewedAt: timestamp('first_viewed_at', { withTimezone: true }).notNull(),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

// Indexes for better performance
export const visitorsIndexes = {
  visitorId: 'idx_visitors_visitor_id',
  lastVisitAt: 'idx_visitors_last_visit_at',
  isNewVisitor: 'idx_visitors_is_new_visitor',
};

export const blogViewsIndexes = {
  visitorId: 'idx_blog_views_visitor_id',
  blogSlug: 'idx_blog_views_blog_slug',
  lastViewedAt: 'idx_blog_views_last_viewed_at',
  visitorBlog: 'idx_blog_views_visitor_blog', // Composite index for visitor + blog
};