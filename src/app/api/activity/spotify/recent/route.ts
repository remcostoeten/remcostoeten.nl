import { NextRequest, NextResponse } from 'next/server';
import { getRecentMusicTracks } from '@/services/spotify-service';

/**
 * Spotify Recent Tracks API Route
 *
 * GET /api/activity/spotify/recent?limit=10
 *
 * Returns recently played tracks
 *
 * Query Parameters:
 * - limit: number of tracks to return (default: 10, max: 50)
 *
 * Response:
 * {
 *   "tracks": [
 *     {
 *       "name": "string",
 *       "artist": "string",
 *       "album": "string",
 *       "external_url": "string",
 *       "image_url": "string?",
 *       "played_at": "string"
 *     }
 *   ]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    let limit = parseInt(searchParams.get('limit') || '10', 10);

    // Validate and clamp limit
    limit = Math.min(Math.max(limit, 1), 50); // Between 1 and 50

    // Add caching headers
    const headers = new Headers({
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300', // 2min cache, 5min stale
      'Content-Type': 'application/json',
    });

    const tracks = await getRecentMusicTracks(limit);

    return NextResponse.json(
      { tracks },
      {
        status: 200,
        headers,
      }
    );

  } catch (error) {
    console.error('Spotify recent tracks API error:', error);

    // Determine appropriate error response
    let status = 500;
    let errorMessage = 'Failed to fetch recent tracks';

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
        tracks: [] // Always return empty array for client compatibility
      },
      {
        status,
        headers: { 'Cache-Control': 'no-cache' }
      }
    );
  }
}

// Enable periodic revalidation
export const dynamic = 'force-dynamic';
export const revalidate = 120; // Revalidate every 2 minutes