import { NextResponse } from 'next/server'
import { githubService } from '@/server/services/github'

export const revalidate = 60 // Cache for 1 minute
export const dynamic = 'force-dynamic'


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')

        if (!date) {
            return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
        }

        // Fetch events for this specific date
        // API expects start and end date, so we use the same date for both to target one day
        const dayActivity = await githubService.getDetailedEvents(date, date)

        // The service returns an array of days (GitHubDayActivity[]), we want the events for the first (and only) day
        const events = dayActivity.length > 0 ? dayActivity[0].events : []

        return NextResponse.json({ events })
    } catch (error) {
        console.error('Error fetching detailed events:', error)
        return NextResponse.json(
            { error: 'Failed to fetch detailed events' },
            { status: 500 }
        )
    }
}
