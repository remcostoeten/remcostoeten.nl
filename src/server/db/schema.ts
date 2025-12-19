import { pgTable, text, index, primaryKey, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

// Re-export auth schema tables
export * from './auth-schema'

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

export const EMOJI_TYPES = ['fire', 'heart', 'clap', 'thinking', 'rocket'] as const
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
