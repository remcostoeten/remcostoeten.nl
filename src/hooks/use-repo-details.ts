'use client';

import { useQuery } from '@tanstack/react-query';

export interface RepoDetails {
    name: string;
    fullName: string;
    description: string | null;
    url: string;
    topics: string[];
    languages: { name: string; color: string; percentage: number }[];
    stars: number;
    forks: number;
    isPrivate: boolean;
    owner: {
        login: string;
        avatarUrl: string;
    };
}

/**
 * Fetch detailed repository info for hover cards
 * Uses lazy loading - only fetches when enabled is true
 */
export function useRepoDetails(owner: string, repo: string, enabled = false) {
    return useQuery({
        queryKey: ['github', 'repo-details', owner, repo],
        queryFn: async () => {
            const response = await fetch(`/api/github/repo?owner=${owner}&repo=${repo}`);
            if (!response.ok) throw new Error('Failed to fetch repo details');
            return response.json() as Promise<RepoDetails>;
        },
        enabled: enabled && !!owner && !!repo,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}
