import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
	fetchInnertube: vi.fn(),
	hasYTMusicCredentials: vi.fn()
}))

const cacheMocks = vi.hoisted(() => ({
	readYTMusicCache: vi.fn(),
	writeYTMusicCache: vi.fn()
}))

vi.mock('@/server/ytmusic/auth', () => authMocks)
vi.mock('@/server/ytmusic/cache', () => cacheMocks)

const cachedTrack = {
	id: 'cached-1',
	name: 'Saved song',
	artist: 'Saved artist',
	album: '',
	url: 'https://music.youtube.com/watch?v=cached-1',
	image: '',
	played_at: '2026-08-01T10:00:00.000Z',
	played_at_estimated: true
}

describe('YouTube Music retrieval', () => {
	beforeEach(() => {
		vi.resetModules()
		authMocks.fetchInnertube.mockReset()
		authMocks.hasYTMusicCredentials.mockReset()
		cacheMocks.readYTMusicCache.mockReset()
		cacheMocks.writeYTMusicCache.mockReset()
		cacheMocks.readYTMusicCache.mockResolvedValue(null)
		cacheMocks.writeYTMusicCache.mockResolvedValue(
			new Date('2026-08-01T12:00:00.000Z')
		)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('serves stale saved tracks when live credentials are absent', async () => {
		authMocks.hasYTMusicCredentials.mockReturnValue(false)
		cacheMocks.readYTMusicCache.mockResolvedValue({
			tracks: [cachedTrack],
			updatedAt: new Date('2026-07-31T12:00:00.000Z')
		})

		const { getYTMusicResult } = await import('@/server/ytmusic/tracks')
		const result = await getYTMusicResult(10)

		expect(result.status).toBe('stale')
		expect(result.source).toBe('database')
		expect(result.tracks).toEqual([cachedTrack])
		expect(authMocks.fetchInnertube).not.toHaveBeenCalled()
	})

	it('does not call YouTube while the persistent cache is fresh', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-08-01T12:00:20.000Z'))
		authMocks.hasYTMusicCredentials.mockReturnValue(true)
		cacheMocks.readYTMusicCache.mockResolvedValue({
			tracks: [cachedTrack],
			updatedAt: new Date('2026-08-01T12:00:00.000Z')
		})

		const { getYTMusicResult } = await import('@/server/ytmusic/tracks')
		const result = await getYTMusicResult(10)

		expect(result.status).toBe('ok')
		expect(result.source).toBe('database')
		expect(result.isStale).toBe(false)
		expect(authMocks.fetchInnertube).not.toHaveBeenCalled()
	})

	it('reports rejected sessions instead of returning a false empty result', async () => {
		authMocks.hasYTMusicCredentials.mockReturnValue(true)
		authMocks.fetchInnertube.mockResolvedValue({
			contents: {
				singleColumnBrowseResultsRenderer: {
					tabs: [
						{
							tabRenderer: {
								content: {
									sectionListRenderer: {
										contents: [
											{
												itemSectionRenderer: {
													contents: [
														{
															messageRenderer: {
																text: {
																	runs: [
																		{
																			text: 'Sign in to view your history'
																		}
																	]
																}
															}
														}
													]
												}
											}
										]
									}
								}
							}
						}
					]
				}
			}
		})

		const { getYTMusicResult } = await import('@/server/ytmusic/tracks')
		const result = await getYTMusicResult(10, { forceRefresh: true })

		expect(result.status).toBe('unauthorized')
		expect(result.tracks).toEqual([])
	})
})
