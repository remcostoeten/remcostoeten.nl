import { pgTable, text, index, boolean, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, createdTimestamp } from './helpers'

export const GITHUB_EVENT_TYPES = [
	'commit',
	'pr',
	'issue',
	'review',
	'release',
	'fork',
	'star',
	'create',
	'delete',
	'unknown'
] as const
export type GitHubEventType = (typeof GITHUB_EVENT_TYPES)[number]

export const githubActivities = pgTable(
	'github_activities',
	{
		...primaryId,
		eventId: text('event_id').notNull().unique(),
		type: text('type').$type<GitHubEventType>().notNull(),
		title: text('title').notNull(),
		description: text('description'),
		repository: text('repository').notNull(),
		url: text('url').notNull(),
		isPrivate: boolean('is_private').default(false).notNull(),
		eventDate: timestamp('event_date').notNull(),
		payload: text('payload'),
		...createdTimestamp
	},
	t => [
		index('github_activities_event_id_idx').on(t.eventId),
		index('github_activities_date_idx').on(t.eventDate),
		index('github_activities_type_idx').on(t.type),
		index('github_activities_repo_idx').on(t.repository)
	]
)

export type GitHubActivity = typeof githubActivities.$inferSelect
export type NewGitHubActivity = typeof githubActivities.$inferInsert
