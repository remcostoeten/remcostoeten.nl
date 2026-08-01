import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const syncMocks = vi.hoisted(() => ({
	getSyncStatus: vi.fn(),
	isAdmin: vi.fn(),
	syncAll: vi.fn(),
	syncGitHubActivities: vi.fn(),
	syncSpotifyListens: vi.fn()
}))

vi.mock('@/server/activity-sync/queries', () => syncMocks)
vi.mock('@/utils/is-admin', () => ({
	isAdmin: syncMocks.isAdmin
}))
vi.mock('@/server/activity-sync/sync-all', () => ({
	syncAll: syncMocks.syncAll
}))
vi.mock('@/server/activity-sync/github-sync', () => ({
	syncGitHubActivities: syncMocks.syncGitHubActivities
}))
vi.mock('@/server/activity-sync/spotify-sync', () => ({
	syncSpotifyListens: syncMocks.syncSpotifyListens
}))

describe('sync route', () => {
	beforeEach(() => {
		vi.resetModules()
		syncMocks.getSyncStatus.mockReset()
		syncMocks.isAdmin.mockReset()
		syncMocks.syncAll.mockReset()
		syncMocks.syncGitHubActivities.mockReset()
		syncMocks.syncSpotifyListens.mockReset()
		vi.unstubAllEnvs()
	})

	it('rejects spoofed cron headers when bearer auth is missing', async () => {
		syncMocks.isAdmin.mockResolvedValue(false)

		const { POST } = await import('@/app/api/sync/route')
		const response = await POST(
			new NextRequest('http://localhost:3000/api/sync', {
				method: 'POST',
				headers: {
					'x-vercel-cron': '1'
				}
			})
		)
		const data = await response.json()

		expect(response.status).toBe(401)
		expect(data).toEqual({ error: 'Unauthorized' })
		expect(syncMocks.syncAll).not.toHaveBeenCalled()
		expect(syncMocks.syncGitHubActivities).not.toHaveBeenCalled()
		expect(syncMocks.syncSpotifyListens).not.toHaveBeenCalled()
	})

	it('rejects unknown sync services even with cron bearer auth', async () => {
		vi.stubEnv('CRON_SECRET', 'cron-secret')

		const { POST } = await import('@/app/api/sync/route')
		const response = await POST(
			new NextRequest('http://localhost:3000/api/sync?service=bogus', {
				method: 'POST',
				headers: {
					authorization: 'Bearer cron-secret'
				}
			})
		)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({ error: 'Invalid service parameter' })
		expect(syncMocks.syncAll).not.toHaveBeenCalled()
		expect(syncMocks.syncGitHubActivities).not.toHaveBeenCalled()
		expect(syncMocks.syncSpotifyListens).not.toHaveBeenCalled()
	})

	it('allows cron bearer auth to trigger a github-only sync', async () => {
		vi.stubEnv('CRON_SECRET', 'cron-secret')
		syncMocks.syncGitHubActivities.mockResolvedValue({
			events: 1
		})

		const { POST } = await import('@/app/api/sync/route')
		const response = await POST(
			new NextRequest('http://localhost:3000/api/sync?service=github', {
				method: 'POST',
				headers: {
					authorization: 'Bearer cron-secret'
				}
			})
		)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data.success).toBe(true)
		expect(data.github).toEqual({ events: 1 })
		expect(syncMocks.isAdmin).not.toHaveBeenCalled()
		expect(syncMocks.syncGitHubActivities).toHaveBeenCalledTimes(1)
		expect(syncMocks.syncSpotifyListens).not.toHaveBeenCalled()
	})
})
