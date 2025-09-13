import type { TEntity } from '../types'
import { crud } from '../core/crud'

/**
 * Create a typed create function for reusable CRUD operations.
 * 
 * @template T - Entity type extending TEntity
 * @returns Typed create function
 * 
 * @example
 * ```typescript
 * type User = { id: string; name: string; email: string }
 * 
 * const create = createFn<User>()
 * 
 * const { data, error } = await create('users')({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * })
 * ```
 */
export function createFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.create<T>(tableName)
}

/**
 * Create a typed read function for reusable CRUD operations.
 * 
 * @template T - Entity type extending TEntity
 * @returns Typed read function with where/byId methods
 * 
 * @example
 * ```typescript
 * type User = { id: string; name: string; age: number; status: 'active' | 'inactive' }
 * 
 * const read = readFn<User>()
 * 
 * // Get all users
 * const { data: users } = await read('users')()
 * 
 * // Get by ID
 * const { data: user } = await read('users').byId('user-123')
 * 
 * // Filter with WHERE
 * const { data: filtered } = await read('users')
 *   .where({ status: 'active' })
 *   .where({ age: '>18' })
 *   .execute()
 * ```
 */
export function readFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.read<T>(tableName)
}

/**
 * Create a typed update function for reusable CRUD operations.
 * 
 * @template T - Entity type extending TEntity
 * @returns Typed update function
 * 
 * @example
 * ```typescript
 * type User = { id: string; name: string; email: string }
 * 
 * const update = updateFn<User>()
 * 
 * const { data, error } = await update('users')('user-123', {
 *   name: 'Jane Doe'
 * })
 * ```
 */
export function updateFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.update<T>(tableName)
}

/**
 * Create a typed delete function for reusable CRUD operations.
 * 
 * @template T - Entity type extending TEntity
 * @returns Typed delete function
 * 
 * @example
 * ```typescript
 * type User = { id: string; name: string; email: string }
 * 
 * const destroy = destroyFn<User>()
 * 
 * const { data, error } = await destroy('users')('user-123')
 * ```
 */
export function destroyFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.delete<T>(tableName)
}