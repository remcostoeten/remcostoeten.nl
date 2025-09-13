/**
 * Generic database type for Drizzle ORM.
 * Supports PostgreSQL, MySQL, and SQLite databases.
 */
export type TDatabase = {
  insert: (table: any) => any
  select: () => any
  update: (table: any) => any
  delete: (table: any) => any
}

/**
 * Schema type containing table definitions.
 */
export type TSchema = Record<string, any>