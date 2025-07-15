import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable(
	"users",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		email: text("email").notNull(),
		name: text("name"),
		emailVerified: text("email_verified"),
		password: text("password").notNull(),
		image: text("image"),
		createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [uniqueIndex("users_email_unique").on(table.email)],
);
