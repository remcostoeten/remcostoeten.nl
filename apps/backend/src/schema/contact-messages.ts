import { pgTable, text, timestamp, integer, index, varchar } from 'drizzle-orm/pg-core';

export const contactMessages = pgTable('contact_messages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 100 }).notNull(),
  contact: varchar('contact', { length: 200 }).notNull(),
  message: text('message').notNull(),
  read: timestamp('read', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index('contact_messages_created_at_idx').on(table.createdAt),
  readIdx: index('contact_messages_read_idx').on(table.read),
}));

export type TContactMessage = typeof contactMessages.$inferSelect;
export type TNewContactMessage = typeof contactMessages.$inferInsert;
