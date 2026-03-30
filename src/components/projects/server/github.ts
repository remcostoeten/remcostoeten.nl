import type { IGitMetrics } from '../types'
import { getGitHubToken } from '@/server/github'

const GITHUB_API = 'https://api.github.com'
const METRICS_TTL_MS = 60 * 60 * 1000
const FAILURE_TTL_MS = 5 * 60 * 1000

const metricsCache = new Map<
	string,
	{ expiresAt: number; value: IGitMetrics | null }
>()

let rateLimitResetAt = 0
let lastRateLimitLog = 0

function isProductionBuildPhase() {
	return (
		process.env.NEXT_PHASE === 'phase-production-build' ||
		process.env.npm_lifecycle_event === 'build'
	)
}

interface IGitHubCommit {
	sha: string
	commit: {
		message: string
		author: { date: string }
	}
}

interface IGitHubRepo {
	pushed_at: string
}

function extractOwnerRepo(
	githubUrl?: string
): { owner: string; repo: string } | null {
	if (!githubUrl) return null
	const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
	if (!match) return null
	return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

function getCachedMetrics(githubUrl: string): IGitMetrics | null | undefined {
	const cached = metricsCache.get(githubUrl)
	if (!cached) return undefined
	if (cached.expiresAt <= Date.now()) {
		metricsCache.delete(githubUrl)
		return undefined
	}
	return cached.value
}

function setCachedMetrics(
	githubUrl: string,
	value: IGitMetrics | null,
	ttlMs: number
) {
	metricsCache.set(githubUrl, {
		value,
		expiresAt: Date.now() + ttlMs
	})
}

function getRateLimitCooldown(response: Response): number {
	const resetHeader = response.headers.get('x-ratelimit-reset')
	if (!resetHeader) return Date.now() + FAILURE_TTL_MS

	const resetAt = Number(resetHeader) * 1000
	return Number.isFinite(resetAt) ? resetAt : Date.now() + FAILURE_TTL_MS
}

async function safeFetch(
	url: string,
	headers: HeadersInit
): Promise<Response | null> {
	if (rateLimitResetAt > Date.now()) {
		return null
	}

	try {
		const res = await fetch(url, { headers, next: { revalidate: 3600 } })
		if (res.status === 403 || res.status === 429) {
			rateLimitResetAt = getRateLimitCooldown(res)
			if (Date.now() - lastRateLimitLog > 1000) {
				lastRateLimitLog = Date.now()
				console.warn(
					`GitHub rate limited until ${new Date(rateLimitResetAt).toISOString()}`
				)
			}
			return null
		}
		if (!res.ok) return null
		return res
	} catch {
		return null
	}
}

export async function fetchGitMetrics(
	githubUrl: string
): Promise<IGitMetrics | null> {
	const cached = getCachedMetrics(githubUrl)
	if (cached !== undefined) {
		return cached
	}

	const parsed = extractOwnerRepo(githubUrl)
	if (!parsed) return null

	const { owner, repo } = parsed
	const token = getGitHubToken()
	const headers: HeadersInit = {
		Accept: 'application/vnd.github.v3+json',
		...(token && {
			Authorization: `Bearer ${token}`
		})
	}

	try {
		const repoRes = await safeFetch(
			`${GITHUB_API}/repos/${owner}/${repo}`,
			headers
		)
		if (!repoRes) {
			setCachedMetrics(githubUrl, null, FAILURE_TTL_MS)
			return null
		}
		const repoData: IGitHubRepo = await repoRes.json()

		const commitsRes = await safeFetch(
			`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=1`,
			headers
		)
		if (!commitsRes) {
			setCachedMetrics(githubUrl, null, FAILURE_TTL_MS)
			return null
		}
		const commits: IGitHubCommit[] = await commitsRes.json()
		const latestCommit = commits[0]

		const linkHeader = commitsRes.headers.get('Link')
		let totalCommits = 1
		if (linkHeader) {
			const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/)
			if (lastPageMatch)
				totalCommits = Number.parseInt(lastPageMatch[1], 10)
		}

		const metrics = {
			lastUpdated: repoData.pushed_at,
			lastCommitMessage:
				latestCommit?.commit.message.split('\n')[0] || 'No commits',
			totalCommits,
			firstCommitDate: repoData.pushed_at,
			weeklyActivity: []
		}
		setCachedMetrics(githubUrl, metrics, METRICS_TTL_MS)
		return metrics
	} catch (error) {
		console.error(`Failed to fetch git metrics for ${githubUrl}:`, error)
		setCachedMetrics(githubUrl, null, FAILURE_TTL_MS)
		return null
	}
}

export async function enrichProjectsWithGitData<
	T extends { github: string; git?: IGitMetrics }
>(projects: T[]): Promise<T[]> {
	if (isProductionBuildPhase()) {
		return projects
	}

	const enriched: T[] = []

	for (const project of projects) {
		if (project.git) {
			enriched.push(project)
			continue
		}
		const git = await fetchGitMetrics(project.github)
		enriched.push(git ? { ...project, git } : project)
		await new Promise(r => setTimeout(r, 100))
	}

	return enriched
}
