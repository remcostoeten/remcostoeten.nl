import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core'

export const feedback = sqliteTable('feedback', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	message: text('message').notNull(),
	emoji: text('emoji').notNull(),
	userAgent: text('user_agent'),
	ipAddress: text('ip_address'),
	referrer: text('referrer'),
	browser: text('browser'),
	createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
})
