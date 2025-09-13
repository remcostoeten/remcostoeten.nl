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
