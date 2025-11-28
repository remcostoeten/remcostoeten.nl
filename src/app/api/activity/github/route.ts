import { NextResponse } from 'next/server';
import { fetchLatestActivities } from '@/services/github-service';

/**
 * GitHub Activity API Route
 *
 * GET /api/activity/github
 *
 * Returns latest GitHub activities (commits) with caching
 *
 * Response:
 * {
 *   "activities": [
 *     {
 *       "latestCommit": "string",
 *       "commitUrl": "string",
 *       "project": "string",
 *       "repositoryUrl": "string",
 *       "timestamp": "string",
 *       "branch": "string?",
 *       "additions": "number?",
 *       "deletions": "number?",
 *       "author": {
 *         "name": "string",
 *         "url": "string?"
 *       }?
 *     }
 *   ]
 * }
 */

export async function GET() {
  try {
    // Add caching headers
    const headers = new Headers({
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      'Content-Type': 'application/json',
    });

    const activities = await fetchLatestActivities();

    return NextResponse.json(activities, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('GitHub activity API error:', error);

    // Return appropriate error response
    const status = error.message.includes('rate limit') ? 429 : 500;
    const errorMessage = error.message.includes('rate limit')
      ? 'GitHub API rate limit exceeded. Please try again later.'
      : 'Failed to fetch GitHub activities';

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        activities: [] // Always return empty array for client compatibility
      },
      {
        status,
        headers: { 'Cache-Control': 'no-cache' }
      }
    );
  }
}

// Enable revalidation for ISR (if using in the future)
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes