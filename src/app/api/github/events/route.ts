import { NextRequest, NextResponse } from 'next/server'
import { githubService } from '@/core/github-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        if (!from || !to) {
            return NextResponse.json(
                { error: 'Missing required parameters: from, to' },
                { status: 400 }
            );
        }

        const events = await githubService.getDetailedEvents(from, to);
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error in /api/github/events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub events' },
            { status: 500 }
        );
    }
}
