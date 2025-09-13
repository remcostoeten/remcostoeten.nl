import { eq } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TResult } from './types'

function destroyRecord<T extends TEntity>() {
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

export { destroyRecord }
