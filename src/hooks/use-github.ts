'use client';

import { useQuery } from '@tanstack/react-query';


export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    name: string | null;
    company: string | null;
    blog: string;
    location: string | null;
    email: string | null;
    bio: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}

export interface GitHubCommit {
    sha: string;
    html_url: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
    };
    author: {
        login: string;
        avatar_url: string;
    } | null;
}

export interface GitHubEvent {
    id: string;
    type: string;
    actor: {
        login: string;
        avatar_url: string;
    };
    repo: {
        name: string;
        url: string;
    };
    payload: {
        ref?: string;
        action?: string;
        head?: string;
        commits?: Array<{
            sha: string;
            message: string;
        }>;
        pull_request?: {
            title: string;
            html_url: string;
        };
        issue?: {
            title: string;
            html_url: string;
        };
    };
    created_at: string;
}

export interface CommitData {
    hash: string;
    shortHash: string;
    message: string;
    date: string;
    url: string;
    author: string;
    projectName?: string;
    color?: string;
}

export interface GitHubActivity {
    events: GitHubEvent[];
    totalCount: number;
}

export interface RecentMultiProjectCommits {
    commits: CommitData[];
    projects: string[];
}

export interface AllGitHubData {
    user: GitHubUser | null;
    activity: GitHubActivity;
    commits: RecentMultiProjectCommits;
}


const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_USERNAME = 'remcostoeten';

const LATEST_PROJECTS = [
    { owner: 'remcostoeten', repo: 'remcostoeten.nl', name: 'remcostoeten.nl', color: 'text-yellow-400' },
    { owner: 'remcostoeten', repo: 'drizzleasy', name: 'drizzleasy', color: 'text-orange-400' },
    { owner: 'remcostoeten', repo: 'fync', name: 'fync', color: 'text-green-400' },
];


function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'remcostoeten-portfolio-activity',
    };

    const token = typeof window === 'undefined'
        ? process.env.GITHUB_TOKEN
        : process.env.NEXT_PUBLIC_GITHUB_TOKEN;

    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    return headers;
}

async function fetchGitHub<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
        headers: getHeaders(),
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        console.error(`GitHub API error: ${response.status} ${response.statusText}. Rate limit: ${rateLimitRemaining}`);
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
}


async function fetchGitHubUser(): Promise<GitHubUser> {
    return fetchGitHub<GitHubUser>(`/users/${GITHUB_USERNAME}`);
}

async function fetchGitHubActivity(limit = 30): Promise<GitHubActivity> {
    const events = await fetchGitHub<GitHubEvent[]>(`/users/${GITHUB_USERNAME}/events?per_page=${limit}`);
    return {
        events,
        totalCount: events.length,
    };
}

async function fetchLatestCommitForRepo(owner: string, repo: string): Promise<CommitData | null> {
    try {
        const commits = await fetchGitHub<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=1`);

        if (commits.length === 0) {
            return null;
        }

        const latestCommit = commits[0];
        const projectInfo = LATEST_PROJECTS.find(p => p.owner === owner && p.repo === repo);

        return {
            hash: latestCommit.sha,
            shortHash: latestCommit.sha.substring(0, 7),
            message: latestCommit.commit.message,
            date: latestCommit.commit.author.date,
            url: latestCommit.html_url,
            author: latestCommit.commit.author.name,
            projectName: projectInfo?.name || repo,
            color: projectInfo?.color || 'text-muted-foreground',
        };
    } catch (error) {
        console.error(`Error fetching commit for ${owner}/${repo}:`, error);
        return null;
    }
}

async function fetchRecentCommits(projectLimit = 5): Promise<RecentMultiProjectCommits> {
    const projectsToFetch = LATEST_PROJECTS.slice(0, projectLimit);

    const commitPromises = projectsToFetch.map(async (project) => {
        const commit = await fetchLatestCommitForRepo(project.owner, project.repo);
        return commit;
    });

    const results = await Promise.all(commitPromises);
    const validCommits = results.filter((c): c is CommitData => c !== null);

    validCommits.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return {
        commits: validCommits,
        projects: projectsToFetch.map(p => p.name),
    };
}

async function fetchAllGitHubData(): Promise<AllGitHubData> {
    const [user, activity, commits] = await Promise.all([
        fetchGitHubUser().catch(() => null),
        fetchGitHubActivity(30),
        fetchRecentCommits(5),
    ]);

    return { user, activity, commits };
}


/**
 * Fetch GitHub user profile data
 */
export function useGitHubUser() {
    return useQuery({
        queryKey: ['github', 'user'],
        queryFn: fetchGitHubUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}

/**
 * Fetch GitHub activity/events
 */
export function useGitHubActivity(limit = 30) {
    return useQuery({
        queryKey: ['github', 'activity', limit],
        queryFn: () => fetchGitHubActivity(limit),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
    });
}

/**
 * Fetch recent commits from your projects
 */
export function useRecentCommits(projectLimit = 5) {
    return useQuery({
        queryKey: ['github', 'commits', projectLimit],
        queryFn: () => fetchRecentCommits(projectLimit),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
    });
}

/**
 * Fetch all GitHub data in one query (user, activity, commits)
 */
export function useAllGitHubData() {
    return useQuery({
        queryKey: ['github', 'all'],
        queryFn: fetchAllGitHubData,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
    });
}

/**
 * Fetch a single commit for a specific repository
 */
export function useLatestCommit(owner: string, repo: string) {
    return useQuery({
        queryKey: ['github', 'commit', owner, repo],
        queryFn: () => fetchLatestCommitForRepo(owner, repo),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
        enabled: !!owner && !!repo,
    });
}

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

/**
 * Fetch detailed events for a date range (for calendar)
 */
export function useGitHubEventsByDate(from: string, to: string) {
    return useQuery({
        queryKey: ['github', 'events', from, to],
        queryFn: async () => {
            if (!from || !to) return [];
            const response = await fetch(`/api/github/events?from=${from}&to=${to}`);
            if (!response.ok) throw new Error('Failed to fetch GitHub events');
            return response.json();
        },
        enabled: !!from && !!to,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch contribution data for the graph
 */
export function useGitHubContributions(year: number = new Date().getFullYear()) {
    return useQuery({
        queryKey: ['github', 'contributions', year],
        queryFn: async () => {
            const response = await fetch(`/api/github/contributions?year=${year}`);
            if (!response.ok) throw new Error('Failed to fetch contributions');
            const data = await response.json();

            // Convert back to Map
            const contributionsMap = new Map<string, any>();
            data.forEach((item: any) => {
                contributionsMap.set(item.date, item.data);
            });
            return contributionsMap;
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}