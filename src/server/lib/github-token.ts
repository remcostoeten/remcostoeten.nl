import { env } from '@/server/env'

let hasWarnedAboutLegacyToken = false

export function getGitHubToken() {
	const token = env.GITHUB_TOKEN?.trim()
	if (token) {
		return token
	}

	const legacyToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN?.trim()
	if (legacyToken) {
		if (!hasWarnedAboutLegacyToken) {
			console.warn(
				'Using legacy NEXT_PUBLIC_GITHUB_TOKEN on the server. Rename it to GITHUB_TOKEN and rotate it because public-prefixed vars are exposed to the client.'
			)
			hasWarnedAboutLegacyToken = true
		}

		return legacyToken
	}

	return ''
}
