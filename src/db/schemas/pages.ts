import {
	integer,
	text,
	sqliteTable,
	uniqueIndex
} from 'drizzle-orm/sqlite-core'

export const pages = sqliteTable(
	'pages',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		slug: text('slug').notNull(),
		title: text('title').notNull(),
		description: text('description'),
		isPublished: integer('is_published').notNull().default(1), // SQLite: use integer for boolean
		createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
		updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP')
	},
	table => [uniqueIndex('pages_slug_unique').on(table.slug)]
)
