import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

/**
 * Local PostgreSQL provider for Docker containers
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