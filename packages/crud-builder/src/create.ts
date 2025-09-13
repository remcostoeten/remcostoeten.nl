import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TCreateInput, TResult } from './types'

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
