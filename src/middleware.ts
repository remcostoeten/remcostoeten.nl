
import { createMiddleware } from '@solidjs/start/middleware';
import { getCookie } from 'vinxi/http';
import { authFactory } from './db/factories/auth-factory';

export default createMiddleware({
  onRequest: [
    async (event) => {
      const url = new URL(event.request.url);
      const authToken = getCookie(event, 'auth_token');

      if (url.pathname.startsWith('/admin')) {
        if (!authToken) {
          return new Response(null, {
            status: 307,
            headers: {
              Location: '/auth/login'
            }
          });
        }

        const sessionValidation = await authFactory.validateSession(authToken);
        if (!sessionValidation.success) {
          return new Response(null, {
            status: 307,
            headers: {
              Location: '/auth/login'
            }
          });
        }
      }

      if (url.pathname.startsWith('/login') && authToken) {
        const sessionValidation = await authFactory.validateSession(authToken);
        if (sessionValidation.success) {
          return new Response(null, {
            status: 307,
            headers: {
              Location: '/admin'
            }
          });
        }
      }
    }
  ]
});
