import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/?error=' + error, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?error=missing_credentials', request.url));
    }

    const authString = `${clientId}:${clientSecret}`;
    const base64Auth = Buffer.from(authString).toString('base64');

    const tokenResponse = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Auth}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri || 'http://127.0.0.1:3000/api/spotify/callback'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.redirect(new URL(`/?error=token_exchange_failed&details=${errorData.error_description || errorData.error}`, request.url));
    }

    const tokenData = await tokenResponse.json();

    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('refresh_token', tokenData.refresh_token);
    redirectUrl.searchParams.set('access_token', tokenData.access_token);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in Spotify callback:', error);
    return NextResponse.redirect(new URL('/?error=unknown_error', request.url));
  }
}