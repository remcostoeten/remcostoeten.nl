import type { TEntity } from './entities'

/**
 * Standard result format for all CRUD operations.
 * Contains either data on success or error on failure.
 * 
 * @template T - Type of the data returned
 * 
 * @example
 * ```typescript
 * const { data, error } = await crud.create<User>('users')({ name: 'John' })
 * 
 * if (error) {
 *   console.error('Operation failed:', error.message)
 * } else {
 *   console.log('Success:', data)
 * }
 * ```
 */
export type TResult<T> = {
  /** Data returned on successful operation */
  data?: T
  /** Error object if operation failed */
  error?: Error
}

/**
 * Complete CRUD operations interface for an entity type.
 * 
 * @template T - Entity type extending TEntity
 */
export type TOperations<T extends TEntity> = {
  create: (data: import('./entities').TCreateInput<T>) => Promise<TResult<T[]>>
  read: {
    all: () => Promise<TResult<T[]>>
    byId?: (id: string | number) => Promise<TResult<T | null>>
  }
  update: (id: string | number, data: import('./entities').TUpdateInput<T>) => Promise<TResult<T[]>>
  destroy: (id: string | number) => Promise<TResult<T[]>>
}