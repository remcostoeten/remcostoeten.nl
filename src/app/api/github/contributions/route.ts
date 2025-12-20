import { NextResponse } from 'next/server'
import { githubService } from '@/server/services/github'

export const dynamic = 'force-dynamic'

async function fetchWithRetry(year: number, maxRetries = 3) {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const contributions = await githubService.getDailyContributions(year)
            return contributions
        } catch (error) {
            lastError = error as Error
            console.warn(`GitHub API attempt ${attempt + 1} failed:`, error)

            if (attempt < maxRetries - 1) {
                const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const yearParam = searchParams.get('year')
        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

        const contributions = await fetchWithRetry(year)

        const contributionsArray = Array.from(contributions.entries()).map(([date, data]) => ({
            date,
            data
        }))

        return NextResponse.json(contributionsArray)
    } catch (error) {
        console.error('Error in /api/github/contributions after retries:', error)
        return NextResponse.json(
            { error: 'Failed to fetch GitHub contributions' },
            { status: 500 }
        )
    }
}
