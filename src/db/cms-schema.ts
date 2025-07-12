import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

// CMS Content Blocks
export const contentBlocks = sqliteTable("content_blocks", {
	id: text("id").primaryKey(),
	pageId: text("page_id").notNull(), // e.g., "home", "about"
	blockType: text("block_type").notNull(), // "heading", "paragraph", "section"
	order: integer("order").notNull().default(0),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

// Content Segments - individual pieces of text with their own styling
export const contentSegments = sqliteTable("content_segments", {
	id: text("id").primaryKey(),
	blockId: text("block_id")
		.notNull()
		.references(() => contentBlocks.id, { onDelete: "cascade" }),
	order: integer("order").notNull().default(0),
	text: text("text").notNull(),
	type: text("type").notNull().default("text"), // "text", "highlighted", "link", "project-card"
	href: text("href"), // for links
	target: text("target"), // "_blank", "_self"
	className: text("class_name"), // custom CSS classes
	style: text("style"), // inline styles as JSON
	metadata: text("metadata"), // JSON for extra data (e.g., project card details)
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

// Style Presets for common text styles
export const stylePresets = sqliteTable("style_presets", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(), // e.g., "frontend-highlight", "company-highlight"
	type: text("type").notNull(), // "highlight", "link", "special"
	className: text("class_name"),
	style: text("style"), // JSON object with CSS properties
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

// Pages configuration
export const pages = sqliteTable("pages", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	description: text("description"),
	isPublished: integer("is_published", { mode: "boolean" })
		.notNull()
		.default(true),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const cmsSchema = {
	contentBlocks,
	contentSegments,
	stylePresets,
	pages,
};
