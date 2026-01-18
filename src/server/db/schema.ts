import { pgTable, text, index, primaryKey, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'
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

export * from './project-schema'

export const blogPosts = pgTable('blog_posts', {
    slug: text('slug').primaryKey(),
    ...viewCounters,
    ...draftStatus,
    ...timestamps,
}, (t) => [
    index('blog_posts_draft_idx').on(t.isDraft),
])

export const blogViews = pgTable('blog_views', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull().references(() => blogPosts.slug, { onDelete: 'cascade' }),
    fingerprint: text('fingerprint').notNull(), // Hash(IP + UserAgent)
    visitorId: text('visitor_id'), // Cookie-based fallback/correlation
    viewedAt: timestamp('viewed_at').defaultNow().notNull(),

    // Geolocation Data
    ipAddress: text('ip_address'), // Optional: consider hashing this too if privacy is strict, but user asked for GEO info
    geoCountry: text('geo_country'),
    geoCity: text('geo_city'),
    geoRegion: text('geo_region'),
    geoLoc: text('geo_loc'),
    geoOrg: text('geo_org'),
    geoTimezone: text('geo_timezone'),
}, (t) => [
    index('blog_views_slug_idx').on(t.slug),
    index('blog_views_fingerprint_idx').on(t.fingerprint), // Fast lookups for uniqueness check
    index('blog_views_visitor_idx').on(t.visitorId),
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
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // Optional: for authenticated users
    ...createdTimestamp,
}, (t) => [
    primaryKey({ columns: [t.slug, t.emoji, t.visitorId] }),
    index('blog_reactions_slug_idx').on(t.slug),
    index('blog_reactions_user_idx').on(t.userId),
])

// Blog comments - authenticated users only
export const blogComments = pgTable('blog_comments', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text('slug').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    parentId: text('parent_id'), // For future threaded replies
    content: text('content').notNull(),
    isEdited: boolean('is_edited').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
    index('blog_comments_slug_idx').on(t.slug),
    index('blog_comments_user_idx').on(t.userId),
    index('blog_comments_parent_idx').on(t.parentId),
])

export type BlogPost = typeof blogPosts.$inferSelect
export type BlogSession = typeof blogSessions.$inferSelect
export type BlogLinkClick = typeof blogLinkClicks.$inferSelect
export type BlogReaction = typeof blogReactions.$inferSelect
export type BlogComment = typeof blogComments.$inferSelect
export type NewBlogComment = typeof blogComments.$inferInsert

// ============================================
// GitHub Activity Tracking
// ============================================

export const GITHUB_EVENT_TYPES = [
    'commit', 'pr', 'issue', 'review', 'release', 'fork', 'star', 'create', 'delete', 'unknown'
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

// ============================================
// Spotify Listening History
// ============================================

export const spotifyListens = pgTable('spotify_listens', {
    ...primaryId,
    trackId: text('track_id').notNull(), // Spotify track ID
    trackName: text('track_name').notNull(),
    artistName: text('artist_name').notNull(),
    albumName: text('album_name'),
    albumImage: text('album_image'),
    trackUrl: text('track_url').notNull(),
    durationMs: integer('duration_ms'),
    playedAt: timestamp('played_at').notNull().unique(), // When the track was played (unique to prevent duplicates)
    // Optional link to a GitHub activity that happened around the same time
    linkedActivityId: text('linked_activity_id').references(() => githubActivities.id, { onDelete: 'set null' }),
    ...createdTimestamp,
}, (t) => [
    index('spotify_listens_played_at_idx').on(t.playedAt),
    index('spotify_listens_track_idx').on(t.trackId),
    index('spotify_listens_artist_idx').on(t.artistName),
    index('spotify_listens_linked_idx').on(t.linkedActivityId),
])

export type SpotifyListen = typeof spotifyListens.$inferSelect
export type NewSpotifyListen = typeof spotifyListens.$inferInsert

// ============================================
// Sync Metadata (for tracking last sync times)
// ============================================

export const syncMetadata = pgTable('sync_metadata', {
    service: text('service').primaryKey(), // 'github' | 'spotify'
    lastSyncAt: timestamp('last_sync_at').notNull(),
    lastEventId: text('last_event_id'), // For GitHub: last event ID, for Spotify: last played_at timestamp
    syncCount: integer('sync_count').default(0).notNull(),
    ...timestamps,
})


export type SyncMetadata = typeof syncMetadata.$inferSelect

// ============================================
// Contact Form Submissions
// ============================================

export const contactSubmissions = pgTable('contact_submissions', {
    ...primaryId,
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject'),
    message: text('message').notNull(),
    ipAddress: text('ip_address'),
    geoCountry: text('geo_country'),
    geoCity: text('geo_city'),
    geoRegion: text('geo_region'),
    geoLoc: text('geo_loc'), // Lat,Long
    geoOrg: text('geo_org'), // ISP/Organization
    geoTimezone: text('geo_timezone'),
    ...createdTimestamp,
})

export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type NewContactSubmission = typeof contactSubmissions.$inferInsert

// ============================================
// Contact Form Interaction Tracking
// ============================================

export const contactInteractions = pgTable('contact_interactions', {
    ...primaryId,
    ...visitorId,
    interactionType: text('interaction_type').notNull(), // 'button_click' | 'form_start' | 'form_abandon'
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    referrer: text('referrer'),
    sessionId: text('session_id'), // Optional: to track user sessions
    geoCountry: text('geo_country'),
    geoCity: text('geo_city'),
    geoRegion: text('geo_region'),
    geoLoc: text('geo_loc'), // Lat,Long
    geoOrg: text('geo_org'), // ISP/Organization
    geoTimezone: text('geo_timezone'),
    ...createdTimestamp,
}, (t) => [
    index('contact_interactions_type_idx').on(t.interactionType),
    index('contact_interactions_visitor_idx').on(t.visitorId),
    index('contact_interactions_session_idx').on(t.sessionId),
    index('contact_interactions_created_idx').on(t.createdAt),
])

export const contactAbandonments = pgTable('contact_abandonments', {
    ...primaryId,
    ...visitorId,
    interactionId: text('interaction_id').references(() => contactInteractions.id, { onDelete: 'cascade' }),
    timeToAbandon: integer('time_to_abandon'), // Time in milliseconds from form start to abandonment
    lastFieldTouched: text('last_field_touched'), // Which field user was last interacting with
    formData: text('form_data'), // JSON string of partial form data
    ipAddress: text('ip_address'),
    geoCountry: text('geo_country'),
    geoCity: text('geo_city'),
    geoRegion: text('geo_region'),
    geoLoc: text('geo_loc'), // Lat,Long
    geoOrg: text('geo_org'), // ISP/Organization
    geoTimezone: text('geo_timezone'),
    ...createdTimestamp,
}, (t) => [
    index('contact_abandonments_interaction_idx').on(t.interactionId),
    index('contact_abandonments_visitor_idx').on(t.visitorId),
    index('contact_abandonments_time_idx').on(t.timeToAbandon),
])

export type ContactInteraction = typeof contactInteractions.$inferSelect
export type NewContactInteraction = typeof contactInteractions.$inferInsert
export type ContactAbandonment = typeof contactAbandonments.$inferSelect
export type NewContactAbandonment = typeof contactAbandonments.$inferInsert

export type BlogView = typeof blogViews.$inferSelect
export type NewBlogView = typeof blogViews.$inferInsert

