import { unstable_cache } from 'next/cache';

const username = 'remcostoeten';

export interface ContributionData {
    total: {
        [year: string]: number;
    };
    contributions: Array<{
        date: string;
        count: number;
        level: number;
    }>;
}

export const getCachedContributions = unstable_cache(
    async () => {
        const url = new URL(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error('Failed to fetch contributions');
        }

        const data = (await response.json()) as ContributionData;
        // API returns 'contributions' as array of { date, count, level }
        return data;
    },
    ['github-contributions'],
    { revalidate: 60 * 60 * 24 } // 24 hours
);
