import { text, sqliteTable } from 'drizzle-orm/sqlite-core'

export const verificationTokens = sqliteTable(
	'verification_tokens',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: text('expires').notNull()
	},
	table => [
		// Composite primary key
		{ primaryKey: ['identifier', 'token'] }
	]
)
