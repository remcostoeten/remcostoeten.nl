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

function update() {
  return function(tableName: string) {
    return function(id: number | string, data: any) {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        return await db.update(schema[tableName]).set(data).where(eq(schema[tableName].id, id)).returning()
      })()
    }
  }
}

export { update }
