'use client';

import { useQuery } from '@tanstack/react-query';

export interface GitHubEventDetail {
    id: string;
    type: 'commit' | 'pr' | 'issue' | 'review' | 'release' | 'fork' | 'star' | 'create' | 'unknown';
    title: string;
    description: string;
    url: string;
    repository: string;
    timestamp: string;
    icon?: string;
    payload?: any;
}

/**
 * Fetch detailed GitHub activity for the activity feed
 */
export function useGitHubRecentActivity(limit = 10) {
    return useQuery({
        queryKey: ['github', 'recent-activity', limit],
        queryFn: async () => {
            const response = await fetch(`/api/github/activity?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch GitHub activity');
            return response.json() as Promise<GitHubEventDetail[]>;
        },
        staleTime: 60 * 1000, // 1 minute
        retry: 2
    });
}