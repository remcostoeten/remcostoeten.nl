import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const pages = sqliteTable(
	"pages",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		slug: text("slug").notNull(),
		title: text("title").notNull(),
		description: text("description"),
		isPublished: integer("is_published").notNull().default(1), // SQLite: use integer for boolean
		isHomepage: integer("is_homepage").notNull().default(0), // SQLite: use integer for boolean
		createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [uniqueIndex("pages_slug_unique").on(table.slug)],
);
