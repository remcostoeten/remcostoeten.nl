import {
	pgTable,
	text,
	index,
	primaryKey,
	timestamp,
	boolean
} from 'drizzle-orm/pg-core'
import { user } from './auth-schema'
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
	geoMetadata
} from './helpers'

export const blogPosts = pgTable(
	'blog_posts',
	{
		slug: text('slug').primaryKey(),
		...viewCounters,
		...draftStatus,
		...timestamps
	},
	t => [index('blog_posts_draft_idx').on(t.isDraft)]
)

export const blogViews = pgTable(
	'blog_views',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		slug: text('slug')
			.notNull()
			.references(() => blogPosts.slug, { onDelete: 'cascade' }),
		fingerprint: text('fingerprint').notNull(),
		visitorId: text('visitor_id'),
		viewedAt: timestamp('viewed_at').defaultNow().notNull(),
		...geoMetadata
	},
	t => [
		index('blog_views_slug_idx').on(t.slug),
		index('blog_views_fingerprint_idx').on(t.fingerprint),
		index('blog_views_visitor_idx').on(t.visitorId)
	]
)

export const blogSessions = pgTable(
	'blog_sessions',
	{
		...primaryId,
		...blogSlug,
		...visitorId,
		...engagementMetrics,
		...deviceType,
		referrer: text('referrer'),
		startedAt: timestamp('started_at').defaultNow().notNull(),
		endedAt: timestamp('ended_at')
	},
	t => [
		index('blog_sessions_slug_idx').on(t.slug),
		index('blog_sessions_visitor_idx').on(t.visitorId)
	]
)

export const blogLinkClicks = pgTable(
	'blog_link_clicks',
	{
		...primaryId,
		...blogSlug,
		...visitorId,
		sessionId: text('session_id').references(() => blogSessions.id, {
			onDelete: 'set null'
		}),
		linkHref: text('link_href').notNull(),
		linkText: text('link_text'),
		isInternal: boolean('is_internal').default(true).notNull(),
		clickedAt: timestamp('clicked_at').defaultNow().notNull()
	},
	t => [index('blog_link_clicks_slug_idx').on(t.slug)]
)

export const EMOJI_TYPES = [
	'fire',
	'heart',
	'clap',
	'thinking',
	'rocket'
] as const
export type EmojiType = (typeof EMOJI_TYPES)[number]

export const blogReactions = pgTable(
	'blog_reactions',
	{
		...blogSlug,
		emoji: text('emoji').$type<EmojiType>().notNull(),
		...visitorId,
		userId: text('user_id').references(() => user.id, {
			onDelete: 'cascade'
		}),
		...createdTimestamp
	},
	t => [
		primaryKey({ columns: [t.slug, t.emoji, t.visitorId] }),
		index('blog_reactions_slug_idx').on(t.slug),
		index('blog_reactions_user_idx').on(t.userId)
	]
)

export const blogComments = pgTable(
	'blog_comments',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		slug: text('slug').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		parentId: text('parent_id'),
		content: text('content').notNull(),
		isEdited: boolean('is_edited').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	t => [
		index('blog_comments_slug_idx').on(t.slug),
		index('blog_comments_user_idx').on(t.userId),
		index('blog_comments_parent_idx').on(t.parentId)
	]
)

export type BlogPost = typeof blogPosts.$inferSelect
export type BlogSession = typeof blogSessions.$inferSelect
export type BlogLinkClick = typeof blogLinkClicks.$inferSelect
export type BlogReaction = typeof blogReactions.$inferSelect
export type BlogComment = typeof blogComments.$inferSelect
export type NewBlogComment = typeof blogComments.$inferInsert
export type BlogView = typeof blogViews.$inferSelect
export type NewBlogView = typeof blogViews.$inferInsert
