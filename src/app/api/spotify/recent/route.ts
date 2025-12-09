import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

// Get recently played tracks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!refreshToken || refreshToken === 'your_refresh_token_here' || refreshToken.startsWith('#')) {
      console.log('🎵 No valid Spotify refresh token configured for recent tracks');
      return NextResponse.json({ error: 'No refresh token configured' }, { status: 404 });
    }

    // Get fresh access token
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing Spotify credentials' }, { status: 500 });
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
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Error refreshing Spotify token for recent tracks:', tokenData.error);
      return NextResponse.json({ error: tokenData.error }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Get recent tracks
    const recentResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!recentResponse.ok) {
      throw new Error(`HTTP ${recentResponse.status}: ${recentResponse.statusText}`);
    }

    const recentData = await recentResponse.json();

    const tracks = recentData.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(', '),
      album: item.track.album.name,
      url: item.track.external_urls.spotify,
      image: item.track.album.images[0]?.url || '',
      played_at: item.played_at
    }));

    return NextResponse.json({ items: recentData.items, tracks });
  } catch (error) {
    console.error('Error in Spotify recent tracks API:', error);
    return NextResponse.json({ error: 'Failed to fetch recent tracks' }, { status: 500 });
  }
}