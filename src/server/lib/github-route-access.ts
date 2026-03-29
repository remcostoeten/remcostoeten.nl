import { env } from '@/server/env'

const DEFAULT_ALLOWED_OWNER = 'remcostoeten'
const REPO_SEGMENT_PATTERN = /^[A-Za-z0-9._-]+$/

function getAllowedOwner() {
	return (env.ALLOWED_GITHUB_USERNAME || DEFAULT_ALLOWED_OWNER).toLowerCase()
}

export function isAllowedGitHubRepo(owner: string, repo: string) {
	return (
		owner.toLowerCase() === getAllowedOwner() &&
		REPO_SEGMENT_PATTERN.test(owner) &&
		REPO_SEGMENT_PATTERN.test(repo)
	)
}
