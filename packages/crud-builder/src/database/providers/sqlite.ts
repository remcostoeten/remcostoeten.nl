import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

/**
 * SQLite provider for local file databases
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