import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const siteIntro = pgTable('site_intro', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	role: text('role').notNull(),
	bio: text('bio').notNull()
})

export type SiteIntroRecord = typeof siteIntro.$inferSelect
