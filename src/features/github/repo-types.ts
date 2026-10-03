import type { Nullable, Timestamp } from '@/store/semantic'

export type RepoRelease = {
	tag: string
	name: string
	url: string
	publishedAt: Nullable<Timestamp>
}

export type RepoCard = {
	name: string
	fullName: string
	description: Nullable<string>
	url: string
	homepage: Nullable<string>
	stars: number
	forks: number
	issues: number
	language: Nullable<string>
	topics: string[]
	pushedAt: Timestamp
	archived: boolean
	license: Nullable<string>
	owner: { login: string; avatarUrl: string }
	release: Nullable<RepoRelease>
}

export type RepoError = 'invalid-slug' | 'not-found' | 'unavailable'

export type RepoResult =
	| { ok: true; data: RepoCard }
	| { ok: false; error: RepoError }
