import { eq } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TResult } from './types'

/**
 * Delete records from a database table.
 * 
 * @template T - Entity type extending TEntity
 * @returns Function that takes table name and returns delete function
 * 
 * @example
 * ```typescript
 * const destroyUser = destroy<User>()
 * const { data, error } = await destroyUser('users')('123')
 * ```
 */
function destroy<T extends TEntity>() {
  return function(tableName: string) {
    return function(id: string | number): Promise<TResult<T[]>> {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.delete(schema[tableName]).where(eq(schema[tableName].id, id)).returning() as T[]
      })
    }
  }
}

export { destroy }
