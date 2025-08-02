import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { authFactory } from '~/db/factories/auth-factory'
import { serialize } from 'cookie';

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json()
    const { email, password } = body

    if (!email || !password) {
      return json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const verificationResult = await authFactory.verifyUser(email, password)
    
    if (!verificationResult.success) {
      return json({ success: false, error: verificationResult.error || 'Invalid credentials' }, { status: 401 })
    }

    const sessionResult = await authFactory.createSession(verificationResult.userId!)
    
    if (!sessionResult.success || !sessionResult.token) {
      return json({ success: false, error: sessionResult.error || 'Failed to create session' }, { status: 500 })
    }

    return json({ success: true }, {
      headers: {
        'Set-Cookie': serialize('auth_token', sessionResult.token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        }),
      },
    });
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return json({ success: false, error: 'Failed to login' }, { status: 500 })
  }
}
