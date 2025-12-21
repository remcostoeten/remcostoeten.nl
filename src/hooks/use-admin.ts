'use client'

import { useEffect, useState } from 'react'
import { checkAdminStatus } from '@/actions/auth'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const admin = await checkAdminStatus()
        setIsAdmin(admin)
      } catch (error) {
        console.error('Failed to verify admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAdmin()
  }, [])

  return { isAdmin, isLoading }
}
