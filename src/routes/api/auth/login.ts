import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { authFactory } from '~/db/factories/auth-factory'

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json()
    const { email } = body

    if (!email) {
      return json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const user = await authFactory.getUserByEmail(email)
    
    if (!user) {
      return json({ success: false, error: 'Invalid email or password' }, { status: 401 })
    }

    const session = await authFactory.createSession(user.id)
    
    return json({ success: true, data: { user, token: session?.token } })
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return json({ success: false, error: 'Failed to login' }, { status: 500 })
  }
}
