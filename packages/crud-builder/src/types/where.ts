/**
 * Simple WHERE clause types with intuitive operators.
 * Supports natural syntax like { age: '>18' } and { name: '*john*' }.
 */

/**
 * Comparison operators for numbers, strings, and dates.
 * Uses natural syntax instead of MongoDB-style operators.
 * 
 * @example
 * ```typescript
 * { age: '>18' }        // Greater than
 * { age: '>=21' }       // Greater than or equal
 * { price: '<100' }     // Less than
 * { rating: '<=4.5' }   // Less than or equal
 * { status: '!inactive' } // Not equal
 * ```
 */
type TComparisonOperator = 
  | `>${string}` 
  | `>=${string}` 
  | `<${string}` 
  | `<=${string}` 
  | `!${string}`

/**
 * String pattern operators for LIKE queries.
 * Uses wildcard syntax similar to shell patterns.
 * 
 * @example
 * ```typescript
 * { name: '*john*' }      // Contains 'john' (LIKE '%john%')
 * { name: 'john*' }       // Starts with 'john' (LIKE 'john%')
 * { email: '*@gmail.com' } // Ends with '@gmail.com' (LIKE '%@gmail.com')
 * ```
 */
type TStringOperator = 
  | `*${string}*`  // Contains
  | `${string}*`   // Starts with
  | `*${string}`   // Ends with

/**
 * All possible WHERE value types for a field.
 * Automatically provides appropriate operators based on field type.
 * 
 * @template T - Field type
 */
type TWhereValue<T> = 
  | T                           // Direct equality: { status: 'active' }
  | T[]                         // Array (IN): { role: ['admin', 'user'] }
  | (T extends number | string | Date ? TComparisonOperator : never)  // Comparison: { age: '>18' }
  | (T extends string ? TStringOperator : never)                       // String patterns: { name: '*john*' }

/**
 * WHERE clause type with full type safety and IntelliSense.
 * Shows only valid fields and operators for each field type.
 * 
 * @template T - Entity type
 * 
 * @example
 * ```typescript
 * type User = { id: string; name: string; age: number; status: 'active' | 'inactive' }
 * 
 * const whereClause: TWhereClause<User> = {
 *   status: 'active',           // ✅ Valid union value
 *   age: '>18',                 // ✅ Valid comparison
 *   name: '*john*',             // ✅ Valid string pattern
 *   role: ['admin', 'user']     // ✅ Valid array (IN)
 * }
 * ```
 */
export type TWhereClause<T> = {
  [K in keyof T]?: TWhereValue<T[K]>
}