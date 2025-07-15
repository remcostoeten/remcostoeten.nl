import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const stylePresets = sqliteTable(
	"style_presets",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull(),
		type: text("type").notNull(),
		className: text("class_name"),
		style: text("style"),
		createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
		updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
	},
	(table) => [uniqueIndex("style_presets_name_unique").on(table.name)],
);
