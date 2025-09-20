import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const blogMetadata = pgTable('blog_metadata', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  readTime: integer('read_time').notNull(),
  tags: json('tags').$type<string[]>().notNull().default([]),
  category: text('category').notNull(),
  status: text('status').notNull().default('published'), // 'published' | 'draft'
  author: text('author'),
  seo: json('seo').$type<{
    title?: string;
    description?: string;
    keywords?: string[];
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

export const blogAnalytics = pgTable('blog_analytics', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  totalViews: integer('total_views').notNull().default(0),
  uniqueViews: integer('unique_views').notNull().default(0),
  recentViews: integer('recent_views').notNull().default(0), // views in last 30 days
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

// Indexes for better performance
export const blogMetadataIndexes = {
  slug: 'idx_blog_metadata_slug',
  publishedAt: 'idx_blog_metadata_published_at',
  category: 'idx_blog_metadata_category',
  status: 'idx_blog_metadata_status',
  tags: 'idx_blog_metadata_tags',
};

export const blogAnalyticsIndexes = {
  slug: 'idx_blog_analytics_slug',
  totalViews: 'idx_blog_analytics_total_views',
  lastViewedAt: 'idx_blog_analytics_last_viewed_at',
};
