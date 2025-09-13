import { and, eq, gt, gte, lt, lte, ne, inArray, like } from 'drizzle-orm'
import type { TWhereClause } from '../types'

/**
 * Parse simple string operators into Drizzle conditions.
 * 
 * @param condition - String condition like '>18', '*john*', etc.
 * @returns Parsed operator and value, or null if no operator found
 * 
 * @internal Used internally by buildWhereConditions
 */
function parseSimpleOperator(condition: string) {
  if (condition.startsWith('>=')) {
    return { operator: 'gte', value: condition.slice(2) }
  }
  if (condition.startsWith('<=')) {
    return { operator: 'lte', value: condition.slice(2) }
  }
  if (condition.startsWith('>')) {
    return { operator: 'gt', value: condition.slice(1) }
  }
  if (condition.startsWith('<')) {
    return { operator: 'lt', value: condition.slice(1) }
  }
  if (condition.startsWith('!')) {
    return { operator: 'ne', value: condition.slice(1) }
  }
  
  // String patterns
  if (condition.startsWith('*') && condition.endsWith('*')) {
    return { operator: 'contains', value: condition.slice(1, -1) }
  }
  if (condition.endsWith('*')) {
    return { operator: 'startsWith', value: condition.slice(0, -1) }
  }
  if (condition.startsWith('*')) {
    return { operator: 'endsWith', value: condition.slice(1) }
  }
  
  return null
}

/**
 * Build Drizzle WHERE conditions from simple syntax.
 * 
 * @template T - Entity type
 * @param whereClause - WHERE clause object with simple operators
 * @param table - Drizzle table schema
 * @returns Combined WHERE condition or undefined
 * 
 * @internal Used internally by CRUD read operations
 * 
 * @example
 * ```typescript
 * // Input: { age: '>18', name: '*john*' }
 * // Output: and(gt(table.age, 18), like(table.name, '%john%'))
 * ```
 */
export function buildWhereConditions<T>(whereClause: TWhereClause<T>, table: any) {
  const conditions: any[] = []

  for (const [field, condition] of Object.entries(whereClause)) {
    const column = table[field]
    
    if (!column) {
      throw new Error(`Field '${field}' not found in table`)
    }

    if (condition === null || condition === undefined) {
      continue
    }

    // Array = IN operator
    if (Array.isArray(condition)) {
      conditions.push(inArray(column, condition))
      continue
    }

    // String operators
    if (typeof condition === 'string') {
      const parsed = parseSimpleOperator(condition)
      
      if (parsed) {
        const { operator, value } = parsed
        const parsedValue = isNaN(Number(value)) ? value : Number(value)
        
        switch (operator) {
          case 'gt':
            conditions.push(gt(column, parsedValue))
            break
          case 'gte':
            conditions.push(gte(column, parsedValue))
            break
          case 'lt':
            conditions.push(lt(column, parsedValue))
            break
          case 'lte':
            conditions.push(lte(column, parsedValue))
            break
          case 'ne':
            conditions.push(ne(column, parsedValue))
            break
          case 'contains':
            conditions.push(like(column, `%${value}%`))
            break
          case 'startsWith':
            conditions.push(like(column, `${value}%`))
            break
          case 'endsWith':
            conditions.push(like(column, `%${value}`))
            break
        }
        continue
      }
    }

    // Direct equality
    conditions.push(eq(column, condition))
  }

  return conditions.length > 0 ? and(...conditions) : undefined
}