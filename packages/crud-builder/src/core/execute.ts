import type { TResult } from '../types'

/**
 * Safely execute a database operation with consistent error handling.
 * 
 * @template T - Return type of the operation
 * @param operation - Async operation to execute
 * @returns Promise with either data or error in consistent format
 * 
 * @internal This is used internally by CRUD operations
 * 
 * @example
 * ```typescript
 * const result = await safeExecute(async () => {
 *   return await db.select().from(users)
 * })
 * 
 * if (result.error) {
 *   console.error('Operation failed:', result.error.message)
 * } else {
 *   console.log('Success:', result.data)
 * }
 * ```
 */
export function safeExecute<T>(operation: () => Promise<T>): Promise<TResult<T>> {
  return (async () => {
    try {
      const data = await operation()
      return { data }
    } catch (error) {
      return { error: error as Error }
    }
  })()
}