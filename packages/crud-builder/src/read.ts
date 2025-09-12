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

function read() {
  return function(tableName: string) {
    return {
      all() {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          return await db.select().from(schema[tableName])
        })()
      }
    }
  }
}

export { read }
