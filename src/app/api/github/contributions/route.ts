import { NextResponse } from 'next/server';
import { githubService } from '@/core/github-service';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get('year');
        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

        const contributions = await githubService.getDailyContributions(year);

        // Convert Map to array of objects for JSON serialization
        const contributionsArray = Array.from(contributions.entries()).map(([date, data]) => ({
            date,
            data
        }));

        return NextResponse.json(contributionsArray);
    } catch (error) {
        console.error('Error in /api/github/contributions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub contributions' },
            { status: 500 }
        );
    }
}
