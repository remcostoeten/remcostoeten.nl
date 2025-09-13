import type { TDatabase, TSchema } from './types'

let db: TDatabase | null = null
let schema: TSchema | null = null

/**
 * Configure the database connection and schema for CRUD operations.
 * Call this once in your application before using any CRUD functions.
 * 
 * @template T - Database type (Drizzle database instance)
 * @template S - Schema type (Drizzle schema object)
 * @param database - Drizzle database instance
 * @param schemaObj - Schema object containing table definitions
 * 
 * @example
 * ```typescript
 * import { drizzle } from 'drizzle-orm/neon-http'
 * import { configure } from '@remcostoeten/crud'
 * import * as schema from './schema'
 * 
 * const db = drizzle(process.env.DATABASE_URL!)
 * configure(db, schema)
 * 
 * // Now you can use CRUD operations
 * const users = await crud.read<User>('users')()
 * ```
 */
function configure<T extends TDatabase, S extends TSchema>(
  database: T, 
  schemaObj: S
) {
  db = database
  schema = schemaObj
}

/**
 * Get the configured database instance.
 * @internal
 */
function getDb(): TDatabase {
  if (!db) {
    throw new Error('Database not configured. Call configure(db, schema) first.')
  }
  return db
}

/**
 * Get the configured schema object.
 * @internal
 */
function getSchema(): TSchema {
  if (!schema) {
    throw new Error('Schema not configured. Call configure(db, schema) first.')
  }
  return schema
}

/**
 * Validate that a table exists in the schema.
 * @internal
 */
function validateTableName(tableName: string, schema: TSchema): void {
  if (!schema[tableName]) {
    throw new Error(`Table '${tableName}' not found in schema. Available tables: ${Object.keys(schema).join(', ')}`)
  }
}

export { configure, getDb, getSchema, validateTableName }
