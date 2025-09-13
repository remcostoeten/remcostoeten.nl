import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

/**
 * PostgreSQL provider for Neon, Vercel, and local Docker
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