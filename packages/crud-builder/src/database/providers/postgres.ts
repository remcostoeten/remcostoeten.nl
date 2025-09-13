import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

/**
 * Setup PostgreSQL connection for cloud providers (Neon, Vercel, Supabase).
 * Uses HTTP-based connection suitable for serverless environments.
 * 
 * @param url - PostgreSQL connection URL
 * @param schema - Drizzle schema object with table definitions
 * @returns Promise resolving to configured Drizzle database instance
 * @throws Error if connection fails
 * 
 * @example
 * ```typescript
 * const db = await setupPostgres('postgresql://user:pass@neon.tech/db', schema)
 * ```
 * 
 * @internal Used internally by initializeConnection
 */
export async function setupPostgres(url: string, schema: any): Promise<any> {
  try {
    const sql = neon(url)
    const db = drizzle(sql, { schema, logger: process.env.NODE_ENV === 'development' })
    return db
  } catch (error) {
    throw new Error(`Failed to connect to PostgreSQL: ${error}`)
  }
}