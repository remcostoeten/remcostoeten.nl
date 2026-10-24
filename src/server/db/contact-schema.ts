import { sql } from 'drizzle-orm'
import {
	pgTable,
	text,
	index,
	integer,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core'
import { primaryId, createdTimestamp, visitorId, geoMetadata } from './helpers'

export const contactSubmissions = pgTable('contact_submissions', {
	...primaryId,
	name: text('name').notNull(),
	email: text('email').notNull(),
	subject: text('subject'),
	message: text('message').notNull(),
	readAt: timestamp('read_at'),
	starredAt: timestamp('starred_at'),
	archivedAt: timestamp('archived_at'),
	repliedAt: timestamp('replied_at'),
	...geoMetadata,
	...createdTimestamp
})

export type ContactReplyStatus = 'pending' | 'sent' | 'failed' | 'uncertain'

export const contactReplies = pgTable(
	'contact_replies',
	{
		...primaryId,
		submissionId: text('submission_id')
			.notNull()
			.references(() => contactSubmissions.id, { onDelete: 'cascade' }),
		fromEmail: text('from_email').notNull(),
		toEmail: text('to_email').notNull(),
		subject: text('subject').notNull(),
		body: text('body').notNull(),
		status: text('status')
			.$type<ContactReplyStatus>()
			.notNull()
			.default('pending'),
		gmailMessageId: text('gmail_message_id'),
		gmailThreadId: text('gmail_thread_id'),
		rfcMessageId: text('rfc_message_id'),
		idempotencyKey: text('idempotency_key').notNull().unique(),
		...createdTimestamp,
		sentAt: timestamp('sent_at'),
		failedAt: timestamp('failed_at'),
		lastError: text('last_error')
	},
	t => [
		index('contact_replies_submission_idx').on(t.submissionId, t.createdAt),
		index('contact_replies_status_idx').on(t.status),
		index('contact_replies_created_idx').on(t.createdAt)
	]
)

export type ReplySnippetKind = 'template' | 'signature'

export const replySnippets = pgTable(
	'reply_snippets',
	{
		...primaryId,
		kind: text('kind').$type<ReplySnippetKind>().notNull(),
		title: text('title').notNull().default(''),
		body: text('body').notNull(),
		...createdTimestamp
	},
	t => [
		uniqueIndex('reply_snippets_signature_idx')
			.on(t.kind)
			.where(sql`${t.kind} = 'signature'`)
	]
)

export const contactInteractions = pgTable(
	'contact_interactions',
	{
		...primaryId,
		...visitorId,
		interactionType: text('interaction_type').notNull(),
		...geoMetadata,
		userAgent: text('user_agent'),
		referrer: text('referrer'),
		sessionId: text('session_id'),
		...createdTimestamp
	},
	t => [
		index('contact_interactions_type_idx').on(t.interactionType),
		index('contact_interactions_visitor_idx').on(t.visitorId),
		index('contact_interactions_session_idx').on(t.sessionId),
		index('contact_interactions_created_idx').on(t.createdAt)
	]
)

export const contactAbandonments = pgTable(
	'contact_abandonments',
	{
		...primaryId,
		...visitorId,
		interactionId: text('interaction_id').references(
			() => contactInteractions.id,
			{ onDelete: 'cascade' }
		),
		timeToAbandon: integer('time_to_abandon'),
		lastFieldTouched: text('last_field_touched'),
		formData: text('form_data'),
		...geoMetadata,
		...createdTimestamp
	},
	t => [
		index('contact_abandonments_interaction_idx').on(t.interactionId),
		index('contact_abandonments_visitor_idx').on(t.visitorId),
		index('contact_abandonments_time_idx').on(t.timeToAbandon)
	]
)

export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type ReplySnippet = typeof replySnippets.$inferSelect
export type ContactReply = typeof contactReplies.$inferSelect
export type NewContactReply = typeof contactReplies.$inferInsert
export type NewContactSubmission = typeof contactSubmissions.$inferInsert
export type ContactInteraction = typeof contactInteractions.$inferSelect
export type NewContactInteraction = typeof contactInteractions.$inferInsert
export type ContactAbandonment = typeof contactAbandonments.$inferSelect
export type NewContactAbandonment = typeof contactAbandonments.$inferInsert
