import {
	integer,
	text,
	sqliteTable,
	uniqueIndex
} from 'drizzle-orm/sqlite-core'

export const accounts = sqliteTable('accounts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	type: text('type').notNull(),
	provider: text('provider').notNull(),
	providerAccountId: text('provider_account_id').notNull(),
	refreshToken: text('refresh_token'),
	accessToken: text('access_token'),
	expiresAt: integer('expires_at'),
	tokenType: text('token_type'),
	scope: text('scope'),
	idToken: text('id_token'),
	sessionState: text('session_state'),
	createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
})
// Add foreign key in migration: userId ➜ users.id ON DELETE CASCADE
