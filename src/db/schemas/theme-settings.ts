import { sql } from "drizzle-orm";
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const themeSettings = sqliteTable(
	"theme_settings",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		settingKey: text("setting_key").notNull().unique(),
		settingValue: text("setting_value").notNull(),
		settingType: text("setting_type").notNull().default("string"),
		description: text("description"),
		isActive: integer("is_active").notNull().default(1),
		createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		uniqueIndex("theme_settings_key_unique").on(table.settingKey),
	],
);

export const defaultThemeSettings = [
	{
		settingKey: "accent_color",
		settingValue: "85 100% 65%",
		settingType: "color",
		description: "Primary accent color for the application",
		isActive: 1,
	},
	{
		settingKey: "accent_color_foreground",
		settingValue: "0 0% 85%",
		settingType: "color",
		description: "Foreground color for accent elements",
		isActive: 1,
	},
];
