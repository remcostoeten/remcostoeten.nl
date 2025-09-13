import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

/**
 * Turso (libSQL) provider with auth token support
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