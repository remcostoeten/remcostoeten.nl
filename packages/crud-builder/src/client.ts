'use client'
import { useOptimistic, useTransition, startTransition as reactStartTransition } from 'react'

function useOptimisticCrud<T extends { id: number | string }>(initialData: T[]) {
  const [optimisticData, addOptimistic] = useOptimistic(
    initialData,
    (state: T[], newItem: Omit<T, 'id'>) => [
      ...state,
      { id: Date.now(), ...newItem } as T
    ]
  )
  
  const [isPending, startTransition] = useTransition()
  
  function optimisticCreate(newItem: Omit<T, 'id'>, serverAction: () => Promise<any>) {
    startTransition(async () => {
      addOptimistic(newItem)
      await serverAction()
    })
  }
  
  return {
    data: optimisticData,
    isPending,
    optimisticCreate
  }
}

function withTransition(serverAction: () => Promise<any>) {
  return function() {
    reactStartTransition(async () => {
      await serverAction()
    })
  }
}

export { useOptimisticCrud, withTransition }
