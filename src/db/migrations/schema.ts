import { pgTable, index, uuid, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const analyticsEvents = pgTable("analytics_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventType: varchar("event_type", { length: 100 }).notNull(),
	page: varchar({ length: 255 }),
	referrer: varchar({ length: 500 }),
	userAgent: text("user_agent"),
	ipAddress: varchar("ip_address", { length: 45 }),
	sessionId: varchar("session_id", { length: 255 }),
	userId: varchar("user_id", { length: 255 }),
	data: jsonb(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	country: varchar({ length: 100 }),
	region: varchar({ length: 100 }),
	city: varchar({ length: 100 }),
	latitude: varchar({ length: 50 }),
	longitude: varchar({ length: 50 }),
}, (table) => [
	index("analytics_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("analytics_page_idx").using("btree", table.page.asc().nullsLast().op("text_ops")),
	index("analytics_timestamp_idx").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("analytics_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);
