import { NextResponse } from 'next/server';
import { getSpotifyAccessToken, hasSpotifyCredentials, invalidateSpotifyTokenCache } from '@/server/services/spotify-auth';

// Use ISR with 30 second revalidation for recent tracks
// (Recently played doesn't change that frequently)
export const revalidate = 30;
export const dynamic = 'force-dynamic';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!hasSpotifyCredentials()) {
      console.log('🎵 No valid Spotify refresh token configured for recent tracks');
      return NextResponse.json({ error: 'No refresh token configured' }, { status: 404 });
    }

    const accessToken = await getSpotifyAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 401 });
    }

    const recentResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Handle 401 by invalidating cache and retrying once
    if (recentResponse.status === 401) {
      invalidateSpotifyTokenCache();
      const retryToken = await getSpotifyAccessToken();
      if (!retryToken) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }

      const retryResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${retryToken}`,
        },
      });

      if (!retryResponse.ok) {
        throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
      }

      const retryData = await retryResponse.json();
      return formatResponse(retryData);
    }

    if (!recentResponse.ok) {
      throw new Error(`HTTP ${recentResponse.status}: ${recentResponse.statusText}`);
    }

    const recentData = await recentResponse.json();
    return formatResponse(recentData);
  } catch (error) {
    console.error('Error in Spotify recent tracks API:', error);
    return NextResponse.json({ error: 'Failed to fetch recent tracks' }, { status: 500 });
  }
}

function formatResponse(data: any) {
  const tracks = data.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artist: item.track.artists.map((artist: any) => artist.name).join(', '),
    album: item.track.album.name,
    url: item.track.external_urls.spotify,
    image: item.track.album.images[0]?.url || '',
    played_at: item.played_at,
  }));

  return NextResponse.json({ items: data.items, tracks });
}