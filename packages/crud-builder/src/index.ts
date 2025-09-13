/**
 * Drizzleasy - Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM
 * 
 * @example Quick start
 * ```typescript
 * import { initializeConnection, readFn, createFn } from '@remcostoeten/drizzleasy'
 * 
 * // Auto-configure database
 * const db = await initializeConnection(process.env.DATABASE_URL!)
 * 
 * // Create typed functions
 * const read = readFn<User>()
 * const create = createFn<User>()
 * 
 * // Use CRUD operations
 * const { data: users } = await read('users')()
 * const { data: newUser } = await create('users')({ name: 'John' })
 * ```
 */

// Main CRUD interface
export { crud } from './core'

// Database connection
export { initializeConnection } from './database'

// Configuration
export { configure } from './config'

// Factory functions
export { createFn, readFn, updateFn, destroyFn } from './factory'

// Client-side utilities
export { useOptimisticCrud, withTransition } from './client'

// Types
export type * from './types'
