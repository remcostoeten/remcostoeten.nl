'use client'

import { useQuery } from '@tanstack/react-query'

type Props = {
	name: string
	fullName: string
	description: string | null
	url: string
	topics: string[]
	languages: { name: string; color: string; percentage: number }[]
	stars: number
	forks: number
	isPrivate: boolean
	owner: {
		login: string
		avatarUrl: string
	}
}

/**
 * Error thrown when the /api/github/repo route responds with a non-OK status.
 * Carries the HTTP status so callers can render a specific message (e.g. a
 * GitHub rate-limit notice) instead of a single generic fallback.
 */
export class RepoDetailsError extends Error {
	readonly status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'RepoDetailsError'
		this.status = status
	}
}

/**
 * Turn a query error into a human-readable message for the hover card.
 * Distinguishes the rate-limit case (the most common trigger when no
 * GITHUB_TOKEN is set) from not-found / auth / generic failures.
 */
export function getRepoDetailsErrorMessage(error: unknown): string {
	const status = error instanceof RepoDetailsError ? error.status : 0

	switch (status) {
		case 401:
		case 403:
		case 429:
			return 'GitHub rate limit reached. Please try again in a little while.'
		case 404:
			return 'Repository not found.'
		default:
			return 'Could not load repository details.'
	}
}

/**
 * Fetch detailed repository info for hover cards
 * Uses lazy loading - only fetches when enabled is true
 */
export function useRepoDetails(owner: string, repo: string, enabled = false) {
	return useQuery({
		queryKey: ['github', 'repo-details', owner, repo],
		queryFn: async () => {
			const response = await fetch(
				`/api/github/repo?owner=${owner}&repo=${repo}`
			)
			if (!response.ok) {
				let message = 'Failed to fetch repo details'
				try {
					const body = await response.json()
					if (body?.error) message = body.error
				} catch {
					// response had no JSON body; keep the default message
				}
				throw new RepoDetailsError(response.status, message)
			}
			return response.json() as Promise<Props>
		},
		enabled: enabled && !!owner && !!repo,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		// Don't retry client errors (rate limit, 404, auth) — retrying just burns
		// more of the already-exhausted unauthenticated request budget.
		retry: (failureCount, error) => {
			const status =
				error instanceof RepoDetailsError ? error.status : 0
			if (status >= 400 && status < 500) return false
			return failureCount < 2
		}
	})
}
