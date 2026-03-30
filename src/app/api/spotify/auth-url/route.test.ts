import { beforeEach, describe, expect, it, vi } from 'vitest'

const securityMocks = vi.hoisted(() => ({
	requireDevToolsAccess: vi.fn()
}))

vi.mock('@/server/security/dev-access', () => securityMocks)

describe('spotify auth-url route', () => {
	beforeEach(() => {
		vi.resetModules()
		securityMocks.requireDevToolsAccess.mockReset()
		securityMocks.requireDevToolsAccess.mockResolvedValue(null)
		vi.unstubAllEnvs()
	})

	it('returns 400 when spotify client id is missing', async () => {
		const { GET } = await import('./route')
		const response = await GET()
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data.error).toContain('SPOTIFY_CLIENT_ID')
	})

	it('builds an auth url with the required scopes and configured redirect uri', async () => {
		vi.stubEnv('SPOTIFY_CLIENT_ID', 'client-123')
		vi.stubEnv(
			'SPOTIFY_REDIRECT_URI',
			'http://127.0.0.1:3000/api/spotify/callback'
		)

		const { GET } = await import('./route')
		const response = await GET()
		const data = await response.json()
		const authUrl = new URL(data.authUrl)

		expect(response.status).toBe(200)
		expect(authUrl.origin).toBe('https://accounts.spotify.com')
		expect(authUrl.pathname).toBe('/authorize')
		expect(authUrl.searchParams.get('client_id')).toBe('client-123')
		expect(authUrl.searchParams.get('redirect_uri')).toBe(
			'http://127.0.0.1:3000/api/spotify/callback'
		)
		expect(authUrl.searchParams.get('show_dialog')).toBe('true')
		expect(authUrl.searchParams.get('scope')).toBe(
			[
				'user-read-currently-playing',
				'user-read-recently-played',
				'user-read-playback-state'
			].join(' ')
		)
	})
})
