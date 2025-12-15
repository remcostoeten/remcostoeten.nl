import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      throw new Error('Missing Spotify credentials in server environment');
    }

    const authString = `${clientId}:${clientSecret}`;
    const base64Auth = Buffer.from(authString).toString('base64');

    const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
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

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.json(
      { error: 'Failed to exchange code for tokens' },
      { status: 500 }
    );
  }
}