import { eq } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TUpdateInput, TResult } from './types'

/**
 * Update existing records in a database table.
 * 
 * @template T - Entity type extending TEntity
 * @returns Function that takes table name and returns update function
 * 
 * @example
 * ```typescript
 * const updateUser = update<User>()
 * const { data, error } = await updateUser('users')('123', {
 *   name: 'Jane',
 *   email: 'jane@example.com'
 * })
 * ```
 */
function update<T extends TEntity>() {
  return function(tableName: string) {
    return function(id: string | number, data: TUpdateInput<T>): Promise<TResult<T[]>> {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.update(schema[tableName]).set(data).where(eq(schema[tableName].id, id)).returning()
      })
    }
  }
}

export { update }
