import { NextResponse } from 'next/server';
import { getCurrentOrRecentMusic } from '@/services/spotify-service';

/**
 * Spotify Current Track API Route
 *
 * GET /api/activity/spotify/current
 *
 * Returns currently playing track or most recent track if nothing is playing
 *
 * Response:
 * {
 *   "track": {
 *     "name": "string",
 *     "artist": "string",
 *     "album": "string",
 *     "external_url": "string",
 *     "preview_url": "string?",
 *     "image_url": "string?",
 *     "is_playing": boolean,
 *     "progress_ms": "number?",
 *     "duration_ms": "number?"
 *   } | {
 *     "name": "string",
 *     "artist": "string",
 *     "album": "string",
 *     "external_url": "string",
 *     "image_url": "string?",
 *     "played_at": "string"
 *   } | null
 * }
 */

export async function GET() {
  try {
    // Add caching headers for current track (shorter cache due to real-time nature)
    const headers = new Headers({
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', // 30s cache, 1min stale
      'Content-Type': 'application/json',
    });

    const track = await getCurrentOrRecentMusic();

    // Ensure the track includes timestamp fields for time ago display
    if (track && !("played_at" in track) && !("started_at" in track)) {
      console.log("Track missing timestamp fields:", track);
    }

    return NextResponse.json(
      { track },
      {
        status: 200,
        headers,
      }
    );

  } catch (error) {
    console.error('Spotify current track API error:', error);

    // Determine appropriate error response
    let status = 500;
    let errorMessage = 'Failed to fetch current track';

    if (error.message.includes('client credentials are not configured')) {
      status = 503; // Service Unavailable
      errorMessage = 'Spotify integration not configured';
    } else if (error.message.includes('token') || error.message.includes('unauthorized')) {
      status = 401; // Unauthorized
      errorMessage = 'Spotify authentication failed';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        track: null // Always return null for client compatibility
      },
      {
        status,
        headers: { 'Cache-Control': 'no-cache' }
      }
    );
  }
}

// Enable real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds for near real-time updates