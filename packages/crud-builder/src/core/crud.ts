import { eq, and, gt, gte, lt, lte, ne, inArray, like } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from '../config'
import { safeExecute } from './execute'
import type { TEntity, TCreateInput, TUpdateInput, TResult, TWhereClause } from '../types'

/**
 * Main CRUD interface with ultra-simple syntax and full type safety.
 * 
 * @example Basic usage
 * ```typescript
 * type User = { id: string; name: string; age: number; status: 'active' | 'inactive' }
 * 
 * // Create
 * const { data, error } = await crud.create<User>('users')({ name: 'John', age: 25, status: 'active' })
 * 
 * // Read all
 * const { data: users } = await crud.read<User>('users')()
 * 
 * // Read with filtering
 * const { data: filtered } = await crud.read<User>('users')
 *   .where({ status: 'active' })     // Exact match
 *   .where({ age: '>18' })           // Greater than
 *   .where({ name: '*john*' })       // Contains
 *   .execute()
 * 
 * // Update
 * await crud.update<User>('users')('user-123', { name: 'Jane' })
 * 
 * // Delete
 * await crud.destroy<User>('users')('user-123')
 * ```
 */
const crudBase = {
  /**
   * Create new records in a table.
   * 
   * @template T - Entity type extending TEntity (must have id field)
   * @param tableName - Name of the database table
   * @returns Function that accepts data and returns a Promise with result
   * 
   * @example
   * ```typescript
   * type User = { id: string; name: string; email: string; age: number }
   * 
   * const { data, error } = await crud.create<User>('users')({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   age: 25
   *   // id, createdAt, updatedAt are auto-generated
   * })
   * 
   * if (error) {
   *   console.error('Failed to create user:', error.message)
   * } else {
   *   console.log('Created user:', data[0])
   * }
   * ```
   */
  create<T extends TEntity>(tableName: string) {
    return (data: TCreateInput<T>): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.insert(schema[tableName]).values(data).returning()
      })
    }
  },

  /**
   * Read records from a table with optional filtering.
   * 
   * @template T - Entity type extending TEntity
   * @param tableName - Name of the database table
   * @returns Callable function and query builder with where/byId methods
   * 
   * @example Basic usage
   * ```typescript
   * type User = { id: string; name: string; age: number; status: 'active' | 'inactive' }
   * 
   * // Get all records
   * const { data: allUsers } = await crud.read<User>('users')()
   * 
   * // Get by ID
   * const { data: user } = await crud.read<User>('users').byId('user-123')
   * 
   * // Filter with WHERE clauses
   * const { data: filtered } = await crud.read<User>('users')
   *   .where({ status: 'active' })           // Exact match
   *   .where({ age: '>18' })                 // Comparison
   *   .where({ name: '*john*' })             // Contains
   *   .where({ role: ['admin', 'user'] })    // IN array
   *   .execute()
   * ```
   * 
   * @example WHERE operators
   * ```typescript
   * .where({ age: '>18' })        // Greater than
   * .where({ age: '>=21' })       // Greater than or equal
   * .where({ price: '<100' })     // Less than
   * .where({ rating: '<=4.5' })   // Less than or equal
   * .where({ status: '!inactive' }) // Not equal
   * .where({ name: '*search*' })  // Contains
   * .where({ name: 'prefix*' })   // Starts with
   * .where({ email: '*@gmail.com' }) // Ends with
   * ```
   */
  read<T extends TEntity>(tableName: string) {
    let whereConditions: any[] = []
    
    const queryBuilder = {
      /**
       * Add a WHERE condition to the query. Multiple where() calls are combined with AND.
       * 
       * @param condition - WHERE condition object with natural syntax
       * @returns Query builder for method chaining
       * 
       * @example
       * ```typescript
       * .where({ status: 'active' })           // status = 'active'
       * .where({ age: '>18' })                 // age > 18
       * .where({ name: '*john*' })             // name LIKE '%john%'
       * .where({ role: ['admin', 'user'] })    // role IN ('admin', 'user')
       * ```
       */
      where(condition: TWhereClause<T>) {
        const { buildWhereConditions } = require('./where')
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        const table = schema[tableName]
        
        const newCondition = buildWhereConditions(condition, table)
        if (newCondition) {
          whereConditions.push(newCondition)
        }
        return queryBuilder
      },
      
      /**
       * Execute the query with all WHERE conditions applied.
       * 
       * @returns Promise with array of matching records
       * 
       * @example
       * ```typescript
       * const { data, error } = await crud.read<User>('users')
       *   .where({ status: 'active' })
       *   .where({ age: '>18' })
       *   .execute()
       * ```
       */
      async execute(): Promise<TResult<T[]>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          const table = schema[tableName]
          
          let query = db.select().from(table)
          
          if (whereConditions.length > 0) {
            query = query.where(and(...whereConditions))
          }
          
          return await query
        })
      },
      
      /**
       * Find a single record by its ID.
       * 
       * @param id - The ID of the record to find
       * @returns Promise with the record or null if not found
       * 
       * @example
       * ```typescript
       * const { data: user, error } = await crud.read<User>('users').byId('user-123')
       * 
       * if (error) {
       *   console.error('Failed to find user:', error.message)
       * } else if (user) {
       *   console.log('Found user:', user.name)
       * } else {
       *   console.log('User not found')
       * }
       * ```
       */
      byId(id: string | number): Promise<TResult<T | null>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          const table = schema[tableName]
          
          const result = await db.select().from(table).where(eq(table.id, id)).limit(1)
          return (result[0] as T) || null
        })
      }
    }
    
    // Make it callable directly (returns all records)
    const callable = async (): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        const table = schema[tableName]
        
        return await db.select().from(table)
      })
    }
    
    // Merge callable with methods
    return Object.assign(callable, queryBuilder)
  },

  /**
   * Update an existing record by ID.
   * 
   * @template T - Entity type extending TEntity
   * @param tableName - Name of the database table
   * @returns Function that accepts ID and update data
   * 
   * @example
   * ```typescript
   * type User = { id: string; name: string; email: string; age: number }
   * 
   * const { data, error } = await crud.update<User>('users')('user-123', {
   *   name: 'Jane Doe',
   *   age: 26
   *   // id and createdAt cannot be updated
   *   // updatedAt is automatically set
   * })
   * 
   * if (error) {
   *   console.error('Failed to update user:', error.message)
   * } else {
   *   console.log('Updated user:', data[0])
   * }
   * ```
   */
  update<T extends TEntity>(tableName: string) {
    return (id: string | number, data: TUpdateInput<T>): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.update(schema[tableName]).set(data).where(eq(schema[tableName].id, id)).returning()
      })
    }
  },

  /**
   * Delete a record by ID.
   * 
   * @template T - Entity type extending TEntity
   * @param tableName - Name of the database table
   * @returns Function that accepts ID and deletes the record
   * 
   * @example
   * ```typescript
   * const { data, error } = await crud.destroy<User>('users')('user-123')
   * 
   * if (error) {
   *   console.error('Failed to delete user:', error.message)
   * } else {
   *   console.log('Deleted user:', data[0])
   * }
   * ```
   */
  destroy<T extends TEntity>(tableName: string) {
    return (id: string | number): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.delete(schema[tableName]).where(eq(schema[tableName].id, id)).returning()
      })
    }
  }
} as const

// Add delete alias for backward compatibility
export const crud = {
  ...crudBase,
  delete: crudBase.destroy
}