import { sql } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const layoutSettings = sqliteTable(
	"layout_settings",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		pageId: integer("page_id").references(() => pages.id, {
			onDelete: "cascade",
		}),
		settingKey: text("setting_key").notNull(),
		settingValue: text("setting_value").notNull(),
		settingType: text("setting_type").notNull().default("string"), // string, number, boolean, json
		description: text("description"),
		createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		uniqueIndex("layout_settings_page_key_unique").on(
			table.pageId,
			table.settingKey,
		),
	],
);

export const globalLayoutSettings = sqliteTable("global_layout_settings", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	settingKey: text("setting_key").notNull().unique(),
	settingValue: text("setting_value").notNull(),
	settingType: text("setting_type").notNull().default("string"), // string, number, boolean, json
	description: text("description"),
	isActive: integer("is_active").notNull().default(1), // SQLite: use integer for boolean
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Import pages table for foreign key reference
import { pages } from "./pages";
