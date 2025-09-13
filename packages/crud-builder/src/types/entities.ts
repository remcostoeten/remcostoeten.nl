/**
 * Base entity type that all database records must extend.
 * Requires an `id` field and optionally includes timestamp fields.
 * 
 * @example
 * ```typescript
 * type User = {
 *   id: string
 *   name: string
 *   email: string
 *   createdAt?: string
 *   updatedAt?: string
 * }
 * ```
 */
export type TEntity = {
  /** Unique identifier for the entity */
  id: string | number
  /** Optional creation timestamp */
  createdAt?: string | Date
  /** Optional update timestamp */
  updatedAt?: string | Date
}

/**
 * Entity type with required timestamp fields.
 * Use this when your entities always have createdAt/updatedAt.
 */
export type TTimestamped = TEntity & {
  createdAt: string | Date
  updatedAt: string | Date
}

/**
 * Input type for create operations.
 * Excludes auto-generated fields (id, createdAt, updatedAt).
 */
export type TCreateInput<T extends TEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Input type for update operations.
 * Excludes id and createdAt (cannot be updated), makes all other fields optional.
 */
export type TUpdateInput<T extends TEntity> = Partial<Omit<T, 'id' | 'createdAt'>>

/**
 * Utility type to ensure an object has an id field.
 */
export type TEntityWithId<T> = T & { id: string | number }