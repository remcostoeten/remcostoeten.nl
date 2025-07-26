import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { authFactory } from '~/db/factories/auth-factory'

export async function POST(event: APIEvent) {
  try {
    const token = event.request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return json({ success: false, error: 'Token is required' }, { status: 401 })
    }

    await authFactory.deleteSession(token)
    
    return json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('POST /api/auth/logout error:', error)
    return json({ success: false, error: 'Failed to logout' }, { status: 500 })
  }
}
