import { text, timestamp, integer, boolean, real } from 'drizzle-orm/pg-core'

export const timestamps = {
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
}

export const createdTimestamp = {
	createdAt: timestamp('created_at').defaultNow().notNull()
}

export const primaryId = {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID())
}

export const visitorId = {
	visitorId: text('visitor_id').notNull()
}

export const optionalVisitorId = {
	visitorId: text('visitor_id')
}

export const blogSlug = {
	slug: text('slug').notNull()
}

export const viewCounters = {
	uniqueViews: integer('unique_views').default(0).notNull(),
	totalViews: integer('total_views').default(0).notNull()
}

export const draftStatus = {
	isDraft: boolean('is_draft').default(false).notNull()
}

export const engagementMetrics = {
	timeOnPage: integer('time_on_page'),
	scrollDepth: real('scroll_depth'),
	reachedEnd: boolean('reached_end').default(false).notNull()
}

export const deviceType = {
	device: text('device').$type<'desktop' | 'mobile' | 'tablet'>()
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet'
