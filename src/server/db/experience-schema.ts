import { jsonb, pgTable, integer } from 'drizzle-orm/pg-core'

export const workExperiences = pgTable('work_experiences', {
	idx: integer('idx').primaryKey(),
	data: jsonb('data').$type<Record<string, unknown>>().notNull()
})

export type WorkExperienceRecord = typeof workExperiences.$inferSelect
