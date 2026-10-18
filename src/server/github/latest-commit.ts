import { cacheLife, cacheTag } from 'next/cache'
import type { LatestCommit } from '@/features/github/types'
import { isAllowedGitHubRepo } from './access'
import { getGitHubToken } from './auth'

const GITHUB_API_BASE = 'https://api.github.com'

type GitHubCommitResponse = {
	html_url: string
	commit: {
		message: string
		author: { date: string }
	}
}

/**
 * @name getLatestCommit
 * @description Loads the newest commit of an allowed repository from the
 * GitHub API and caches it across requests, so pages render it without a
 * client-side request.
 *
 * @example
 * const commit = await getLatestCommit('remcostoeten', 'remcostoeten.nl')
 * if (commit) console.log(commit.message)
 */
export async function getLatestCommit(
	owner: string,
	repo: string
): Promise<LatestCommit | null> {
	'use cache'
	cacheTag('github', 'latest-commit')

	if (!isAllowedGitHubRepo(owner, repo)) {
		cacheLife('hours')
		return null
	}

	const token = getGitHubToken()
	const headers: HeadersInit = {
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'remcostoeten-portfolio-activity',
		...(token && { Authorization: `Bearer ${token}` })
	}

	try {
		const response = await fetch(
			`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`,
			{ headers }
		)

		if (!response.ok) {
			console.error(
				`GitHub latest commit failed for ${owner}/${repo}: ${response.status}`
			)
			cacheLife('minutes')
			return null
		}

		const commits: GitHubCommitResponse[] = await response.json()
		const latest = commits[0]

		if (!latest) {
			cacheLife('minutes')
			return null
		}

		cacheLife('hours')
		return {
			message: latest.commit.message.split('\n')[0],
			date: latest.commit.author.date,
			url: latest.html_url
		}
	} catch (error) {
		console.error(
			`GitHub latest commit failed for ${owner}/${repo}:`,
			error
		)
		cacheLife('minutes')
		return null
	}
}
