import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { authFactory } from '~/db/factories/auth-factory'

const getAuthToken = (request: Request): string | null => {
  const authorization = request.headers.get('Authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }
  return authorization.slice(7)
}

export async function GET(event: APIEvent) {
  try {
    const token = getAuthToken(event.request)
    
    if (!token) {
      return json({ success: false, error: 'Authentication token required' }, { status: 401 })
    }

    const session = await authFactory.getSessionByToken(token)
    
    if (!session) {
      return json({ success: false, error: 'Invalid or expired session' }, { status: 401 })
    }

    const user = await authFactory.getUserById(session.userId)
    
    if (!user) {
      return json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const { ...safeUser } = user
    return json({ success: true, data: safeUser })
  } catch (error) {
    console.error('GET /api/auth/me error:', error)
    return json({ success: false, error: 'Failed to get user info' }, { status: 500 })
  }
}
