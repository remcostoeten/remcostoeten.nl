import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TResult } from './types'

function read<T extends TEntity>() {
  return function(tableName: string) {
    return {
      all(): Promise<TResult<T[]>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          return await db.select().from(schema[tableName]) as T[]
        })
      }
    }
  }
}

export { read }
