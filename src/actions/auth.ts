'use server'

import { auth } from '@/server/auth'
import { env } from '@/server/env'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = env.ADMIN_EMAIL

export async function checkAdminStatus(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const session = await auth.api.getSession({
      headers: {
        cookie: cookieHeader
      }
    })

    if (!session?.user) {
      return false
    }

    const isEmailMatch = session.user.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase()
    const isRoleAdmin = session.user.role === 'admin'

    return isRoleAdmin || isEmailMatch
  } catch (error) {
    console.error('[checkAdminStatus] Error:', error)
    return false
  }
}
