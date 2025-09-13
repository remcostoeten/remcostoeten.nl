import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

/**
 * Setup SQLite connection for local file-based databases.
 * Supports both file paths and in-memory databases.
 * 
 * @param url - SQLite database URL (file:./db.sqlite or file::memory:)
 * @param schema - Drizzle schema object with table definitions
 * @returns Promise resolving to configured Drizzle database instance
 * @throws Error if connection fails
 * 
 * @example
 * ```typescript
 * // File database
 * const db = await setupSqlite('file:./database.db', schema)
 * 
 * // In-memory database
 * const db = await setupSqlite('file::memory:', schema)
 * ```
 * 
 * @internal Used internally by initializeConnection
 */
export async function setupSqlite(url: string, schema: any): Promise<any> {
  try {
    // Remove 'file:' prefix if present
    const dbPath = url.startsWith('file:') ? url.slice(5) : url
    
    const sqlite = new Database(dbPath)
    const db = drizzle(sqlite, { schema, logger: process.env.NODE_ENV === 'development' })
    return db
  } catch (error) {
    throw new Error(`Failed to connect to SQLite: ${error}`)
  }
}