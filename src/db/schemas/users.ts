import {
	integer,
	text,
	sqliteTable,
	uniqueIndex
} from 'drizzle-orm/sqlite-core'

export const users = sqliteTable(
	'users',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		email: text('email').notNull(),
		name: text('name'),
		emailVerified: text('email_verified'),
		image: text('image'),
		createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
		updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
	},
	table => [uniqueIndex('users_email_unique').on(table.email)]
)
