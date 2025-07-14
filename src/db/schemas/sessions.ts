import {
	integer,
	text,
	sqliteTable,
	uniqueIndex
} from 'drizzle-orm/sqlite-core'

export const sessions = sqliteTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		userId: integer('user_id').notNull(),
		expiresAt: text('expires_at'),
		token: text('token').notNull(),
		createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
		updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent')
	},
	table => [uniqueIndex('sessions_token_unique').on(table.token)]
)
// Add foreign key in migration: userId ➜ users.id ON DELETE CASCADE
