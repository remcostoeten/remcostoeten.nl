import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

/**
 * Setup Turso (libSQL) connection with authentication token.
 * Turso is a distributed SQLite service that requires auth tokens.
 * 
 * @param url - Turso database URL (libsql://your-db.turso.io)
 * @param authToken - Turso authentication token
 * @param schema - Drizzle schema object with table definitions
 * @returns Promise resolving to configured Drizzle database instance
 * @throws Error if connection fails
 * 
 * @example
 * ```typescript
 * const db = await setupTurso(
 *   'libsql://my-db.turso.io',
 *   process.env.TURSO_AUTH_TOKEN!,
 *   schema
 * )
 * ```
 * 
 * @internal Used internally by initializeConnection
 */
export async function setupTurso(url: string, authToken: string, schema: any): Promise<any> {
  try {
    const client = createClient({
      url,
      authToken
    })
    
    const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' })
    return db
  } catch (error) {
    throw new Error(`Failed to connect to Turso: ${error}`)
  }
}