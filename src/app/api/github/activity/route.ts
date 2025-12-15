import { NextResponse } from 'next/server'
import { githubService } from '@/services/github-service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limitParam = searchParams.get('limit')
        const limit = limitParam ? parseInt(limitParam) : 10

        const activity = await githubService.getRecentActivity(limit)

        return NextResponse.json(activity)
    } catch (error) {
        console.error('Error in /api/github/activity:', error)
        return NextResponse.json(
            { error: 'Failed to fetch GitHub activity' },
            { status: 500 }
        )
    }
}
