import { eq } from 'drizzle-orm'
import { getDb, getSchema } from './config'

function safeExecute<T>(operation: () => Promise<T>) {
  return async function(): Promise<{ data?: T; error?: Error }> {
    try {
      const data = await operation()
      return { data }
    } catch (error) {
      return { error: error as Error }
    }
  }
}

function deleteRecord() {
  return function(tableName: string) {
    return function(id: number | string) {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        return await db.delete(schema[tableName]).where(eq(schema[tableName].id, id)).returning()
      })()
    }
  }
}

export { deleteRecord }
