import { beforeEach, describe, expect, it, vi } from 'vitest'

const syncMocks = vi.hoisted(() => ({
	syncLastfmListens: vi.fn()
}))

vi.mock('@/server/lastfm/sync', () => syncMocks)

function createRequest(authorization?: string) {
	return new Request('https://www.remcostoeten.nl/api/spotify/sync', {
		headers: authorization ? { authorization } : {}
	})
}

describe('listen sync route', () => {
	beforeEach(() => {
		vi.resetModules()
		syncMocks.syncLastfmListens.mockReset()
		vi.unstubAllEnvs()
	})

	it('rejects every request when no cron secret is configured', async () => {
		vi.stubEnv('CRON_SECRET', '')

		const { GET } = await import('@/app/api/spotify/sync/route')
		const response = await GET(createRequest('Bearer '))

		expect(response.status).toBe(401)
		expect(syncMocks.syncLastfmListens).not.toHaveBeenCalled()
	})

	it('rejects a wrong bearer token', async () => {
		vi.stubEnv('CRON_SECRET', 'secret-123')

		const { GET } = await import('@/app/api/spotify/sync/route')
		const response = await GET(createRequest('Bearer wrong'))

		expect(response.status).toBe(401)
		expect(syncMocks.syncLastfmListens).not.toHaveBeenCalled()
	})

	it('returns the sync result for the cron secret', async () => {
		vi.stubEnv('CRON_SECRET', 'secret-123')
		syncMocks.syncLastfmListens.mockResolvedValue({
			fetched: 50,
			saved: 3
		})

		const { GET } = await import('@/app/api/spotify/sync/route')
		const response = await GET(createRequest('Bearer secret-123'))

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({
			fetched: 50,
			saved: 3
		})
	})

	it('returns 503 when last.fm is not configured', async () => {
		vi.stubEnv('CRON_SECRET', 'secret-123')
		syncMocks.syncLastfmListens.mockResolvedValue(null)

		const { GET } = await import('@/app/api/spotify/sync/route')
		const response = await GET(createRequest('Bearer secret-123'))

		expect(response.status).toBe(503)
	})

	it('returns 500 when saving fails', async () => {
		vi.stubEnv('CRON_SECRET', 'secret-123')
		syncMocks.syncLastfmListens.mockRejectedValue(new Error('db down'))
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})

		const { GET } = await import('@/app/api/spotify/sync/route')
		const response = await GET(createRequest('Bearer secret-123'))

		expect(response.status).toBe(500)
		consoleError.mockRestore()
	})
})
