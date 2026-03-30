import { env } from '@/server/env'

export function getGitHubToken() {
	const token = env.GITHUB_TOKEN?.trim()
	if (token) {
		return token
	}

	return ''
}
