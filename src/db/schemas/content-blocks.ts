import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentBlocks = sqliteTable("content_blocks", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	pageId: text("page_id").notNull(),
	blockType: text("block_type").notNull(),
	order: integer("order").notNull().default(0),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
