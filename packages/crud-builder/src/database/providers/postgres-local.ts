import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

/**
 * Setup local PostgreSQL connection for Docker containers and local development.
 * Uses connection pooling and disables SSL for local environments.
 * 
 * @param url - PostgreSQL connection URL (typically localhost:5432)
 * @param schema - Drizzle schema object with table definitions
 * @returns Promise resolving to configured Drizzle database instance
 * @throws Error if connection fails
 * 
 * @example
 * ```typescript
 * const db = await setupPostgresLocal('postgresql://user:pass@localhost:5432/mydb', schema)
 * ```
 * 
 * @internal Used internally by initializeConnection
 */
export async function setupPostgresLocal(url: string, schema: any): Promise<any> {
  try {
    const pool = new Pool({
      connectionString: url,
      ssl: false // Local Docker doesn't need SSL
    })
    
    const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' })
    return db
  } catch (error) {
    throw new Error(`Failed to connect to local PostgreSQL: ${error}`)
  }
}