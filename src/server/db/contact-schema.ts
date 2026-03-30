import {
	pgTable,
	text,
	index,
	integer
} from 'drizzle-orm/pg-core'
import {
	primaryId,
	createdTimestamp,
	visitorId,
	geoMetadata
} from './helpers'

export const contactSubmissions = pgTable('contact_submissions', {
	...primaryId,
	name: text('name').notNull(),
	email: text('email').notNull(),
	subject: text('subject'),
	message: text('message').notNull(),
	...geoMetadata,
	...createdTimestamp
})

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
export type NewContactSubmission = typeof contactSubmissions.$inferInsert
export type ContactInteraction = typeof contactInteractions.$inferSelect
export type NewContactInteraction = typeof contactInteractions.$inferInsert
export type ContactAbandonment = typeof contactAbandonments.$inferSelect
export type NewContactAbandonment = typeof contactAbandonments.$inferInsert
