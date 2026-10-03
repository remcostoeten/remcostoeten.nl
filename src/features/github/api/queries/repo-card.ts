import { cacheLife, cacheTag } from 'next/cache'
import { z } from 'zod'
import { getGitHubToken } from '@/server/github/auth'
import type { RepoCard, RepoResult } from '../../repo-types'

const GITHUB_API = 'https://api.github.com'

const slugSchema = z
	.string()
	.trim()
	.regex(/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/)

const repoSchema = z.object({
	name: z.string(),
	full_name: z.string(),
	description: z.string().nullable(),
	html_url: z.string().url(),
	homepage: z.string().nullable().optional(),
	stargazers_count: z.number(),
	forks_count: z.number(),
	open_issues_count: z.number(),
	language: z.string().nullable(),
	topics: z.array(z.string()).optional(),
	pushed_at: z.string(),
	archived: z.boolean(),
	license: z.object({ spdx_id: z.string().nullable() }).nullable(),
	owner: z.object({ login: z.string(), avatar_url: z.string().url() })
})

const releaseSchema = z.object({
	tag_name: z.string(),
	name: z.string().nullable(),
	html_url: z.string().url(),
	published_at: z.string().nullable()
})

function getHeaders(): HeadersInit {
	const token = getGitHubToken()
	return {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'remcostoeten-blog',
		...(token && { Authorization: `Bearer ${token}` })
	}
}

async function fetchRelease(slug: string) {
	const response = await fetch(
		`${GITHUB_API}/repos/${slug}/releases/latest`,
		{
			headers: getHeaders()
		}
	)
	if (!response.ok) return null

	const parsed = releaseSchema.safeParse(await response.json())
	if (!parsed.success) return null

	return {
		tag: parsed.data.tag_name,
		name: parsed.data.name || parsed.data.tag_name,
		url: parsed.data.html_url,
		publishedAt: parsed.data.published_at
	}
}

function toRepoCard(
	repo: z.infer<typeof repoSchema>,
	release: RepoCard['release']
): RepoCard {
	const license = repo.license?.spdx_id
	return {
		name: repo.name,
		fullName: repo.full_name,
		description: repo.description,
		url: repo.html_url,
		homepage: repo.homepage || null,
		stars: repo.stargazers_count,
		forks: repo.forks_count,
		issues: repo.open_issues_count,
		language: repo.language,
		topics: repo.topics ?? [],
		pushedAt: repo.pushed_at,
		archived: repo.archived,
		license: license && license !== 'NOASSERTION' ? license : null,
		owner: { login: repo.owner.login, avatarUrl: repo.owner.avatar_url },
		release
	}
}

/**
 * @name getRepoCard
 * @description Fetches public repository details and the latest release for
 * an `owner/repo` slug, validated with Zod and cached per slug.
 *
 * @example
 * const result = await getRepoCard('remcostoeten/gh-select')
 * if (result.ok) console.log(result.data.stars)
 */
export async function getRepoCard(input: string): Promise<RepoResult> {
	'use cache'

	const slug = slugSchema.safeParse(input)
	if (!slug.success) {
		cacheLife('max')
		return { ok: false, error: 'invalid-slug' }
	}

	cacheTag('github-repo-card', `github-repo-card:${slug.data.toLowerCase()}`)

	try {
		const [repoResponse, release] = await Promise.all([
			fetch(`${GITHUB_API}/repos/${slug.data}`, {
				headers: getHeaders()
			}),
			fetchRelease(slug.data)
		])

		if (repoResponse.status === 404) {
			cacheLife('hours')
			return { ok: false, error: 'not-found' }
		}

		if (!repoResponse.ok) {
			cacheLife('minutes')
			return { ok: false, error: 'unavailable' }
		}

		const repo = repoSchema.safeParse(await repoResponse.json())
		if (!repo.success) {
			cacheLife('minutes')
			return { ok: false, error: 'unavailable' }
		}

		cacheLife('hours')
		return { ok: true, data: toRepoCard(repo.data, release) }
	} catch (error) {
		console.error(`[getRepoCard] ${slug.data}:`, error)
		cacheLife('minutes')
		return { ok: false, error: 'unavailable' }
	}
}
