import { NextResponse } from 'next/server'
import { githubService } from '@/server/services/github'

export const revalidate = 60 // Cache for 1 minute

export async function GET() {
	try {
		const activity = await githubService.getRecentActivity(10)
		return NextResponse.json(activity)
	} catch (error) {
		console.error('Error in /api/github/activity:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch GitHub activity' },
			{ status: 500 }
		)
	}
}
