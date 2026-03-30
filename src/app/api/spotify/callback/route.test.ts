import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const securityMocks = vi.hoisted(() => ({
	requireDevToolsAccess: vi.fn()
}))

vi.mock('@/server/security/dev-access', () => securityMocks)

describe('spotify callback route', () => {
	beforeEach(() => {
		vi.resetModules()
		securityMocks.requireDevToolsAccess.mockReset()
		securityMocks.requireDevToolsAccess.mockResolvedValue(null)
		vi.unstubAllEnvs()
		vi.unstubAllGlobals()
	})

	it('redirects missing code back to the configured app origin', async () => {
		vi.stubEnv(
			'SPOTIFY_REDIRECT_URI',
			'http://127.0.0.1:3000/api/spotify/callback'
		)

		const { GET } = await import('./route')
		const response = await GET(
			new NextRequest('http://localhost:3000/api/spotify/callback')
		)

		expect(response.status).toBe(307)
		expect(response.headers.get('location')).toBe(
			'http://127.0.0.1:3000/?error=no_code'
		)
	})

	it('sets dev token cookies and redirects to the configured app origin on success', async () => {
		vi.stubEnv('SPOTIFY_CLIENT_ID', 'client-123')
		vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'secret-123')
		vi.stubEnv(
			'SPOTIFY_REDIRECT_URI',
			'http://127.0.0.1:3000/api/spotify/callback'
		)

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue({
					refresh_token: 'refresh-123',
					access_token: 'access-123'
				})
			})
		)

		const { GET } = await import('./route')
		const response = await GET(
			new NextRequest(
				'http://localhost:3000/api/spotify/callback?code=auth-code-123'
			)
		)

		expect(response.status).toBe(307)
		expect(response.headers.get('location')).toBe(
			'http://127.0.0.1:3000/dev/spotify?success=true'
		)

		const setCookie = response.headers.getSetCookie().join('\n')
		expect(setCookie).toContain('spotify_dev_refresh_token=refresh-123')
		expect(setCookie).toContain('spotify_dev_access_token=access-123')
	})
})
