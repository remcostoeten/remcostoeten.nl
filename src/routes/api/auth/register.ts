import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { authFactory } from '~/db/factories/auth-factory'

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const existingUser = await authFactory.getUserByEmail(email)
    
    if (existingUser) {
      return json({ success: false, error: 'Email is already in use' }, { status: 409 })
    }

    const user = await authFactory.createUser({ email, name, role: 'user' })
    const session = await authFactory.createSession(user.id)
    
    return json({ success: true, data: { user, token: session?.token } })
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return json({ success: false, error: 'Failed to register' }, { status: 500 })
  }
}
