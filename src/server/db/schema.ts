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

// ============================================
// GitHub Activity Tracking
// ============================================

export const GITHUB_EVENT_TYPES = [
    'commit', 'pr', 'issue', 'review', 'release', 'fork', 'star', 'create', 'unknown'
] as const
export type GitHubEventType = typeof GITHUB_EVENT_TYPES[number]

export const githubActivities = pgTable('github_activities', {
    ...primaryId,
    eventId: text('event_id').notNull().unique(), // GitHub's event ID for deduplication
    type: text('type').$type<GitHubEventType>().notNull(),
    title: text('title').notNull(),
    description: text('description'),
    repository: text('repository').notNull(),
    url: text('url').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    eventDate: timestamp('event_date').notNull(), // When the event occurred on GitHub
    payload: text('payload'), // JSON stringified payload for extra data
    ...createdTimestamp,
}, (t) => [
    index('github_activities_event_id_idx').on(t.eventId),
    index('github_activities_date_idx').on(t.eventDate),
    index('github_activities_type_idx').on(t.type),
    index('github_activities_repo_idx').on(t.repository),
])

export type GitHubActivity = typeof githubActivities.$inferSelect
export type NewGitHubActivity = typeof githubActivities.$inferInsert
