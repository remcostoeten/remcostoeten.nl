import { findDrizzleConfig, loadSchemaFromConfig } from './config-loader'
import { setupPostgres } from './providers/postgres'
import { setupPostgresLocal } from './providers/postgres-local'
import { setupSqlite } from './providers/sqlite'
import { setupTurso } from './providers/turso'

type ConnectionOptions = {
  authToken?: string
}

type ConnectionConfig = {
  url: string
  authToken?: string
}

type MultiConnectionConfig = {
  [key: string]: string | ConnectionConfig
} | {
  development?: string | ConnectionConfig
  production?: string | ConnectionConfig
  test?: string | ConnectionConfig
}

const connectionCache = new Map<string, any>()

/**
 * Initialize database connection with auto-detection and schema loading.
 * 
 * @example Single database
 * ```typescript
 * const db = await initializeConnection(process.env.DATABASE_URL!)
 * ```
 * 
 * @example Turso with auth token
 * ```typescript
 * const db = await initializeConnection(process.env.DATABASE_URL!, {
 *   authToken: process.env.TURSO_AUTH_TOKEN
 * })
 * ```
 * 
 * @example Environment switching
 * ```typescript
 * const db = await initializeConnection({
 *   development: 'file:./dev.db',
 *   production: process.env.DATABASE_URL!
 * })
 * ```
 */
export async function initializeConnection(
  input: string | MultiConnectionConfig,
  options?: ConnectionOptions
): Promise<any> {
  // Single URL
  if (typeof input === 'string') {
    return createSingleConnection(input, options)
  }
  
  // Multi-database config
  if (typeof input === 'object') {
    // Environment-based switching
    if ('development' in input || 'production' in input) {
      const env = process.env.NODE_ENV || 'development'
      const config = input[env as keyof typeof input]
      
      if (typeof config === 'string') {
        return createSingleConnection(config, options)
      } else if (config && typeof config === 'object') {
        return createSingleConnection(config.url, { authToken: config.authToken })
      }
      
      throw new Error(`No configuration found for environment: ${env}`)
    }
    
    // Named databases
    const connections: Record<string, any> = {}
    for (const [name, config] of Object.entries(input)) {
      if (typeof config === 'string') {
        connections[name] = await createSingleConnection(config)
      } else if (config && typeof config === 'object') {
        connections[name] = await createSingleConnection(config.url, { authToken: config.authToken })
      }
    }
    return connections
  }
  
  throw new Error('Invalid connection configuration')
}

async function createSingleConnection(url: string, options?: ConnectionOptions) {
  const cacheKey = `${url}:${options?.authToken || ''}`
  
  if (connectionCache.has(cacheKey)) {
    return connectionCache.get(cacheKey)
  }
  
  // Load schema from drizzle.config.ts
  const schema = await loadSchemaFromConfig()
  
  let connection: any
  
  // Detect provider from URL
  if (url.startsWith('libsql://')) {
    if (!options?.authToken) {
      throw new Error('Turso requires authToken option')
    }
    connection = await setupTurso(url, options.authToken, schema)
  } else if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    // Detect local vs cloud PostgreSQL
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':5432')) {
      connection = await setupPostgresLocal(url, schema)
    } else {
      connection = await setupPostgres(url, schema)
    }
  } else if (url.startsWith('file:') || url.endsWith('.db')) {
    connection = await setupSqlite(url, schema)
  } else {
    throw new Error(`Unsupported database URL format: ${url}`)
  }
  
  connectionCache.set(cacheKey, connection)
  return connection
}