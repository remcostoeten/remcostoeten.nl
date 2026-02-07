import { NextRequest, NextResponse } from 'next/server'
import {
	syncAll,
	syncGitHubActivities,
	syncSpotifyListens,
	getSyncStatus
} from '@/server/services/activity-sync'
import { isAdmin } from '@/utils/is-admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/sync - Get sync status
 * POST /api/sync - Trigger a sync (admin or cron only)
 * POST /api/sync?service=github - Sync only GitHub
 * POST /api/sync?service=spotify - Sync only Spotify
 */

export async function GET() {
	try {
		const status = await getSyncStatus()
		return NextResponse.json(status)
	} catch (error) {
		console.error('Error getting sync status:', error)
		return NextResponse.json(
			{ error: 'Failed to get sync status' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get('authorization')
		const cronSecret = process.env.CRON_SECRET
		const isCronRequest =
			cronSecret && authHeader === `Bearer ${cronSecret}`

		const isVercelCron = request.headers.get('x-vercel-cron') === '1'

		if (!isCronRequest && !isVercelCron) {
			const userIsAdmin = await isAdmin()
			if (!userIsAdmin) {
				return NextResponse.json(
					{ error: 'Unauthorized' },
					{ status: 401 }
				)
			}
		}

		const service = request.nextUrl.searchParams.get('service')

		console.log(`[Sync] Starting sync... (service: ${service || 'all'})`)
		const startTime = Date.now()

		let result
		if (service === 'github') {
			result = { github: await syncGitHubActivities() }
		} else if (service === 'spotify') {
			result = { spotify: await syncSpotifyListens() }
		} else {
			result = await syncAll()
		}

		const duration = Date.now() - startTime
		console.log(`[Sync] Completed in ${duration}ms`, result)

		return NextResponse.json({
			success: true,
			duration,
			...result
		})
	} catch (error) {
		console.error('Sync error:', error)
		return NextResponse.json(
			{
				error: 'Sync failed',
				message:
					error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}
