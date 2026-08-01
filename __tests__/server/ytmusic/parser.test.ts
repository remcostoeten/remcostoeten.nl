import { describe, expect, it } from 'vitest'
import {
	parseInnertubeTracks,
	stabilizeTrackTimestamps,
	YTMusicUnauthorizedError
} from '@/server/ytmusic/parser'

function createHistoryResponse(title = 'Today') {
	return {
		contents: {
			singleColumnBrowseResultsRenderer: {
				tabs: [
					{
						tabRenderer: {
							content: {
								sectionListRenderer: {
									contents: [
										{
											musicShelfRenderer: {
												title: {
													runs: [{ text: title }]
												},
												contents: [
													createTrackRenderer()
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
	}
}

function createTrackRenderer() {
	return {
		musicResponsiveListItemRenderer: {
			overlay: {
				musicItemThumbnailOverlayRenderer: {
					content: {
						musicPlayButtonRenderer: {
							playNavigationEndpoint: {
								watchEndpoint: { videoId: 'video-1' }
							}
						}
					}
				}
			},
			flexColumns: [
				{
					musicResponsiveListItemFlexColumnRenderer: {
						text: { runs: [{ text: 'Test song' }] }
					}
				},
				{
					musicResponsiveListItemFlexColumnRenderer: {
						text: {
							runs: [
								{ text: 'Test artist' },
								{ text: ' • ' },
								{ text: '1.2K views' }
							]
						}
					}
				},
				{
					musicResponsiveListItemFlexColumnRenderer: {
						text: { runs: [{ text: 'Test album' }] }
					}
				}
			],
			thumbnail: {
				musicThumbnailRenderer: {
					thumbnail: {
						thumbnails: [
							{
								url: 'https://i.ytimg.com/vi/video-1/default.jpg'
							}
						]
					}
				}
			}
		}
	}
}

describe('YouTube Music response parser', () => {
	it('normalizes history tracks and marks inferred timestamps', () => {
		const tracks = parseInnertubeTracks(
			createHistoryResponse(),
			10,
			new Date('2026-08-01T18:00:00.000Z')
		)

		expect(tracks).toEqual([
			{
				id: 'video-1',
				name: 'Test song',
				artist: 'Test artist',
				album: 'Test album',
				url: 'https://music.youtube.com/watch?v=video-1',
				image: 'https://i.ytimg.com/vi/video-1/default.jpg',
				played_at: '2026-08-01T18:00:00.000Z',
				played_at_estimated: true,
				played_at_label: 'Today'
			}
		])
	})

	it('turns sign-in payloads into an authentication error', () => {
		const response = createHistoryResponse() as any
		response.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents =
			[
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

		expect(() => parseInnertubeTracks(response, 10)).toThrow(
			YTMusicUnauthorizedError
		)
	})

	it('preserves valid timestamps from the persistent cache', () => {
		const [fresh] = parseInnertubeTracks(createHistoryResponse(), 1)
		const cached = {
			...fresh,
			played_at: '2026-07-31T12:00:00.000Z'
		}

		expect(stabilizeTrackTimestamps([fresh], [cached])[0].played_at).toBe(
			'2026-07-31T12:00:00.000Z'
		)
	})
})
