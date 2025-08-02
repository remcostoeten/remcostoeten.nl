import { json } from '@solidjs/router';
import { authFactory } from '~/db/factories/auth-factory';
import { getCookie } from 'vinxi/http';
import { serialize } from 'cookie';

export async function POST(event) {
  try {
    const authToken = getCookie(event, 'auth_token');

    if (authToken) {
      await authFactory.invalidateSession(authToken);
    }

    return json({ success: true }, {
      headers: {
        'Set-Cookie': serialize('auth_token', '', {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 0, // Expire the cookie immediately
        }),
      },
    });
  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    return json({ success: false, error: 'Failed to logout' }, { status: 500 });
  }
}