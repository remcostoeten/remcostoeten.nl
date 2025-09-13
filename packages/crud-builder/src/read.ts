import { eq, and } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TResult, TWhereClause } from './types'

/**
 * Read records from a database table with optional filtering.
 * 
 * @template T - Entity type extending TEntity
 * @returns Function that takes table name and returns query builder
 * 
 * @example
 * ```typescript
 * const readUser = read<User>()
 * 
 * // Get all records
 * const { data: users } = await readUser('users')()
 * 
 * // Get by ID
 * const { data: user } = await readUser('users').byId('123')
 * 
 * // Filter with WHERE
 * const { data: filtered } = await readUser('users')
 *   .where({ status: 'active' })
 *   .execute()
 * ```
 */
function read<T extends TEntity>() {
  return function(tableName: string) {
    let whereConditions: any[] = []
    
    const queryBuilder = {
      where(condition: TWhereClause<T>) {
        const { buildWhereConditions } = require('./core/where')
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        const table = schema[tableName]
        
        const newCondition = buildWhereConditions(condition, table)
        if (newCondition) {
          whereConditions.push(newCondition)
        }
        return queryBuilder
      },
      
      async execute(): Promise<TResult<T[]>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          const table = schema[tableName]
          
          let query = db.select().from(table)
          
          if (whereConditions.length > 0) {
            query = query.where(and(...whereConditions))
          }
          
          return await query
        })
      },
      
      byId(id: string | number): Promise<TResult<T | null>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          const table = schema[tableName]
          
          const result = await db.select().from(table).where(eq(table.id, id)).limit(1)
          return (result[0] as T) || null
        })
      }
    }
    
    // Make it callable directly (returns all records)
    const callable = async (): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        const table = schema[tableName]
        
        return await db.select().from(table)
      })
    }
    
    // Merge callable with methods
    return Object.assign(callable, queryBuilder)
  }
}

export { read }
