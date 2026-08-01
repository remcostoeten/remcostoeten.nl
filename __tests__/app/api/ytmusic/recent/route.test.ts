import { beforeEach, describe, expect, it, vi } from 'vitest'

const trackMocks = vi.hoisted(() => ({
	getYTMusicResult: vi.fn()
}))

vi.mock('@/server/ytmusic/tracks', () => trackMocks)

describe('YouTube Music recent route', () => {
	beforeEach(() => {
		vi.resetModules()
		trackMocks.getYTMusicResult.mockReset()
	})

	it('passes bounded limits and forced refresh to the service', async () => {
		trackMocks.getYTMusicResult.mockResolvedValue({
			status: 'ok',
			tracks: []
		})
		const { GET } = await import('@/app/api/ytmusic/recent/route')
		const response = await GET(
			new Request(
				'http://localhost/api/ytmusic/recent?limit=999&refresh=1'
			)
		)

		expect(response.status).toBe(200)
		expect(trackMocks.getYTMusicResult).toHaveBeenCalledWith(50, {
			forceRefresh: true
		})
	})

	it.each([
		['unauthorized', 401],
		['unconfigured', 503],
		['error', 502]
	])('maps %s service results to HTTP %i', async (status, httpStatus) => {
		trackMocks.getYTMusicResult.mockResolvedValue({ status, tracks: [] })
		const { GET } = await import('@/app/api/ytmusic/recent/route')
		const response = await GET(
			new Request('http://localhost/api/ytmusic/recent')
		)

		expect(response.status).toBe(httpStatus)
	})
})
