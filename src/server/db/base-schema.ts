import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const baseFields = {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
};

export type BaseFieldsType = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
