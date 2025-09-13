import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TCreateInput, TResult } from './types'

/**
 * Create new records in a database table.
 * 
 * @template T - Entity type extending TEntity
 * @returns Function that takes table name and returns create function
 * 
 * @example
 * ```typescript
 * const createUser = create<User>()
 * const { data, error } = await createUser('users')({
 *   name: 'John',
 *   email: 'john@example.com'
 * })
 * ```
 */
function create<T extends TEntity>() {
  return function(tableName: string) {
    return function(data: TCreateInput<T>): Promise<TResult<T[]>> {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.insert(schema[tableName]).values(data).returning()
      })
    }
  }
}

export { create }
