import { NextResponse } from 'next/server';
import { getSpotifyAccessToken, hasSpotifyCredentials, invalidateSpotifyTokenCache } from '@/server/services/spotify-auth';

// Now playing needs to be dynamic since it changes frequently
// But we still use the cached token for performance
export const dynamic = 'force-dynamic';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';


export async function GET() {
    try {
        if (!hasSpotifyCredentials()) {
            return NextResponse.json({ isPlaying: false, message: 'No refresh token configured' });
        }

        const accessToken = await getSpotifyAccessToken();

        if (!accessToken) {
            return NextResponse.json({ isPlaying: false, error: 'Failed to get access token' });
        }

        const nowPlayingResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Handle 401 by invalidating cache and retrying once
        if (nowPlayingResponse.status === 401) {
            invalidateSpotifyTokenCache();
            const retryToken = await getSpotifyAccessToken();
            if (!retryToken) {
                return NextResponse.json({ isPlaying: false, error: 'Authentication failed' });
            }

            const retryResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
                headers: {
                    'Authorization': `Bearer ${retryToken}`,
                },
            });

            return handleNowPlayingResponse(retryResponse);
        }

        return handleNowPlayingResponse(nowPlayingResponse);
    } catch (error) {
        console.error('Error in Spotify now playing API:', error);
        return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 });
    }
}

async function handleNowPlayingResponse(response: Response) {
    // 204 = no content (nothing playing)
    if (response.status === 204 || response.status > 400) {
        return NextResponse.json({ isPlaying: false });
    }

    const data = await response.json();

    if (!data.item) {
        return NextResponse.json({ isPlaying: false });
    }

    const item = data.item;

    const track = {
        id: item.id,
        name: item.name,
        artist: item.artists.map((artist: any) => artist.name).join(', '),
        album: item.album.name,
        url: item.external_urls.spotify,
        image: item.album.images[0]?.url || '',
        played_at: new Date().toISOString(),
        duration_ms: item.duration_ms,
    };

    return NextResponse.json({
        isPlaying: data.is_playing,
        progress_ms: data.progress_ms,
        duration_ms: item.duration_ms,
        track,
    });
}
