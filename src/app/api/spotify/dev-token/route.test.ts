import { beforeEach, describe, expect, it, vi } from 'vitest'

const securityMocks = vi.hoisted(() => ({
	requireDevToolsAccess: vi.fn()
}))

const cookiesMocks = vi.hoisted(() => ({
	cookies: vi.fn()
}))

vi.mock('@/server/security/dev-access', () => securityMocks)
vi.mock('next/headers', () => cookiesMocks)

describe('spotify dev-token route', () => {
	beforeEach(() => {
		vi.resetModules()
		securityMocks.requireDevToolsAccess.mockReset()
		securityMocks.requireDevToolsAccess.mockResolvedValue(null)
		cookiesMocks.cookies.mockReset()
	})

	it('reads the token cookies and clears them in the response', async () => {
		cookiesMocks.cookies.mockResolvedValue({
			get: vi.fn((name: string) => {
				if (name === 'spotify_dev_refresh_token') {
					return { value: 'refresh-123' }
				}

				if (name === 'spotify_dev_access_token') {
					return { value: 'access-123' }
				}

				return undefined
			})
		})

		const { GET } = await import('./route')
		const response = await GET()
		const data = await response.json()
		const setCookie = response.headers.getSetCookie().join('\n')

		expect(response.status).toBe(200)
		expect(response.headers.get('Cache-Control')).toBe('no-store')
		expect(data).toEqual({
			refresh_token: 'refresh-123',
			access_token: 'access-123'
		})
		expect(setCookie).toContain('spotify_dev_refresh_token=;')
		expect(setCookie).toContain('spotify_dev_access_token=;')
	})
})
