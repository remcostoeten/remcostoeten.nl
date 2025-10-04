import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

export function getOrCreateSessionId(c: Context): string {
  const SESSION_COOKIE_NAME = 'blog_session_id';
  
  let sessionId = getCookie(c, SESSION_COOKIE_NAME);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setCookie(c, SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  
  return sessionId;
}

export function getSessionData(c: Context) {
  return {
    sessionId: getOrCreateSessionId(c),
    ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    userAgent: c.req.header('user-agent') || 'unknown',
    referrer: c.req.header('referer') || undefined,
  };
}