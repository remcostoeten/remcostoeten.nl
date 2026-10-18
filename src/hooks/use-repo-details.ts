'use client'

import { useEffect, useState } from 'react'

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
export function getRepoDetailsErrorMessage(error: Error | null): string {
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

const CACHE_TTL_MS = 5 * 60 * 1000

type CacheEntry = {
	request: Promise<Props>
	expiresAt: number
}

const requestCache = new Map<string, CacheEntry>()

async function requestRepoDetails(owner: string, repo: string) {
	const response = await fetch(`/api/github/repo?owner=${owner}&repo=${repo}`)
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
}

function loadRepoDetails(owner: string, repo: string) {
	const key = `${owner}/${repo}`
	const cached = requestCache.get(key)
	if (cached && cached.expiresAt > Date.now()) return cached.request

	const request = requestRepoDetails(owner, repo)
	requestCache.set(key, { request, expiresAt: Date.now() + CACHE_TTL_MS })
	request.catch(() => requestCache.delete(key))
	return request
}

/**
 * Fetch detailed repository info for hover cards
 * Uses lazy loading - only fetches when enabled is true
 */
export function useRepoDetails(owner: string, repo: string, enabled = false) {
	const [data, setData] = useState<Props>()
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		if (!enabled || !owner || !repo) return

		let cancelled = false
		setError(null)
		loadRepoDetails(owner, repo)
			.then(details => {
				if (!cancelled) setData(details)
			})
			.catch((reason: Error) => {
				if (!cancelled) setError(reason)
			})

		return () => {
			cancelled = true
		}
	}, [enabled, owner, repo])

	return {
		data,
		error,
		isError: error !== null,
		isLoading: enabled && data === undefined && error === null
	}
}
