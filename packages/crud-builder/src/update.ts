import { eq } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TUpdateInput, TResult } from './types'

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
