import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { getCookie } from 'vinxi/http'
import { authFactory } from '~/db/factories/auth-factory'

export async function GET(event: APIEvent) {
  try {
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
      return json({ success: false, error: 'Authentication token required' }, { status: 401 })
    }

    const sessionValidationResult = await authFactory.validateSession(token)
    
    if (!sessionValidationResult.success) {
      return json({ success: false, error: sessionValidationResult.error || 'Invalid or expired session' }, { status: 401 })
    }

    const user = await authFactory.getUserById(sessionValidationResult.userId!)
    
    if (!user) {
      return json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const { passwordHash, ...safeUser } = user as any
    return json({ success: true, data: safeUser })
  } catch (error) {
    console.error('GET /api/auth/me error:', error)
    return json({ success: false, error: 'Failed to get user info' }, { status: 500 })
  }
}
