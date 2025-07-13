import {
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

export const feedback = sqliteTable("feedback", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	message: text("message").notNull(),
	emoji: text("emoji").notNull(),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
	referrer: text("referrer"),
	browser: text("browser"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export type TDbFeedback = typeof feedback.$inferSelect;
