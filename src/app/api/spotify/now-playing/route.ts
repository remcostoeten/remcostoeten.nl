import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';

export async function GET(request: NextRequest) {
    try {
        const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

        if (!refreshToken || refreshToken === 'your_refresh_token_here' || refreshToken.startsWith('#')) {
            return NextResponse.json({ isPlaying: false, message: 'No refresh token configured' });
        }

        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: 'Missing Spotify credentials' }, { status: 500 });
        }

        const authString = `${clientId}:${clientSecret}`;
        const base64Auth = Buffer.from(authString).toString('base64');

        // 1. Refresh Access Token
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
            console.error('Error refreshing Spotify token for now playing:', tokenData.error);
            return NextResponse.json({ error: tokenData.error }, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // 2. Fetch Currently Playing
        const nowPlayingResponse = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (nowPlayingResponse.status === 204 || nowPlayingResponse.status > 400) {
            // 204 means nothing is playing
            return NextResponse.json({ isPlaying: false });
        }

        const data = await nowPlayingResponse.json();

        if (!data.item) {
            return NextResponse.json({ isPlaying: false });
        }

        const isPlaying = data.is_playing;
        const progressMs = data.progress_ms;
        const item = data.item;

        const track = {
            id: item.id,
            name: item.name,
            artist: item.artists.map((artist: any) => artist.name).join(', '),
            album: item.album.name,
            url: item.external_urls.spotify,
            image: item.album.images[0]?.url || '',
            played_at: new Date().toISOString(), // Current time for "now"
            duration_ms: item.duration_ms
        };

        return NextResponse.json({
            isPlaying,
            progress_ms: progressMs,
            duration_ms: item.duration_ms,
            track
        });

    } catch (error) {
        console.error('Error in Spotify now playing API:', error);
        return NextResponse.json({ error: 'Failed to fetch now playing' }, { status: 500 });
    }
}
