'use client'

import { useTransition, startTransition as reactStartTransition } from 'react'
// @ts-ignore - useOptimistic is experimental
import { useOptimistic } from 'react'
import type { TEntity, TResult } from '../types'

/**
 * React hook for performing **optimistic CRUD operations** on a local dataset.
 * 
 * - Immediately updates the UI with a temporary item before the server action resolves.
 * - Falls back gracefully if the server action fails.
 * - Provides `isPending` state for spinners/loading indicators.
 *
 * @template T The entity type extending `TEntity`
 * 
 * @param initialData - The initial list of entities
 * 
 * @returns An object containing:
 * - `data`: The current optimistic dataset
 * - `isPending`: Boolean state indicating if a transition is in progress
 * - `optimisticCreate`: Function to add a new entity optimistically
 * 
 * @example
 * ```tsx
 * const { data, isPending, optimisticCreate } = useOptimisticCrud<User>(users)
 * 
 * function handleAddUser() {
 *   optimisticCreate({ name: 'John' }, () => createUserOnServer({ name: 'John' }))
 * }
 * ```
 */
function useOptimisticCrud<T extends TEntity>(initialData: T[]) {
  const [optimisticData, addOptimistic] = useOptimistic(
    initialData,
    (state: T[], newItem: Omit<T, 'id'>) => [
      ...state,
      { id: crypto.randomUUID(), ...newItem } as T
    ]
  )
  
  const [isPending, startTransition] = useTransition()
  
  function optimisticCreate(
    newItem: Omit<T, 'id'>, 
    serverAction: () => Promise<TResult<T[]>>
  ) {
    startTransition(() => {
      addOptimistic(newItem)
      serverAction().then(result => {
        if (result.error) {
          console.error('Server action failed:', result.error)
        }
      }).catch(error => {
        console.error('Optimistic create failed:', error)
      })
    })
  }
  
  return {
    data: optimisticData,
    isPending,
    optimisticCreate
  }
}

/**
 * Utility to wrap a **server action** in a React transition.
 * 
 * - Runs the server action inside `startTransition` to avoid blocking UI rendering.
 * - Handles and logs errors from the server action.
 *
 * @template T The result type of the server action
 * 
 * @param serverAction - A server action returning a `Promise<TResult<T>>`
 * 
 * @returns A function you can call to start the transition.
 * 
 * @example
 * ```tsx
 * const saveUser = withTransition(() => updateUserOnServer(user))
 * 
 * <button onClick={saveUser}>Save</button>
 * ```
 */
function withTransition<T>(serverAction: () => Promise<TResult<T>>) {
  return function() {
    reactStartTransition(() => {
      serverAction().then(result => {
        if (result.error) {
          console.error('Server action failed:', result.error)
        }
      }).catch(error => {
        console.error('Transition failed:', error)
      })
    })
  }
}

export { useOptimisticCrud, withTransition }
