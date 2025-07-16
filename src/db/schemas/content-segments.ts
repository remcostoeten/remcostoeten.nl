import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentSegments = sqliteTable("content_segments", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	blockId: integer("block_id").notNull(),
	order: integer("order").notNull().default(0),
	text: text("text").notNull(),
	type: text("type").notNull().default("text"),
	href: text("href"),
	target: text("target"),
	className: text("class_name"),
	style: text("style"),
	metadata: text("metadata"),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
// Add foreign key in migration: blockId ➜ content_blocks.id ON DELETE CASCADE
