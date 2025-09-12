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

function create() {
  return function(tableName: string) {
    return function(data: any) {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        return await db.insert(schema[tableName]).values(data).returning()
      })()
    }
  }
}

export { create }
