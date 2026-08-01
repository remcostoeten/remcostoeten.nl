import type { YTMusicTrack } from '@/features/ytmusic/types'

const YTM_BASE = 'https://music.youtube.com'
const APPROXIMATE_TRACK_SPACING_MS = 3 * 60 * 1000

type Renderer = Record<string, any>

export class YTMusicUnauthorizedError extends Error {
	constructor(message = 'YouTube Music rejected the configured session') {
		super(message)
		this.name = 'YTMusicUnauthorizedError'
	}
}

export function parseInnertubeTracks(
	data: unknown,
	limit: number,
	now = new Date()
): YTMusicTrack[] {
	const sections = getSections(data)
	assertAuthenticatedResponse(sections)

	const tracks: YTMusicTrack[] = []
	for (const section of sections) {
		const shelf =
			section?.musicShelfRenderer ?? section?.musicCarouselShelfRenderer
		if (!shelf?.contents) continue

		const playedLabel = getText(shelf.title)
		for (const rawTrack of shelf.contents) {
			if (tracks.length >= limit) return tracks

			const item = rawTrack?.musicResponsiveListItemRenderer
			if (!item) continue

			const id = getVideoId(item)
			const name = getFlexColumnText(item, 0)
			if (!id || !name) continue

			tracks.push({
				id,
				name,
				artist: extractArtists(item) || 'Unknown',
				album: getFlexColumnText(item, 2),
				url: `${YTM_BASE}/watch?v=${id}`,
				image: extractThumbnail(item),
				played_at: estimatePlayedAt(playedLabel, tracks.length, now),
				played_at_estimated: true,
				...(playedLabel && { played_at_label: playedLabel })
			})
		}
	}

	return tracks
}

export function stabilizeTrackTimestamps(
	freshTracks: YTMusicTrack[],
	cachedTracks: YTMusicTrack[]
): YTMusicTrack[] {
	const cachedByOccurrence = new Map<string, YTMusicTrack>()
	const cachedCounts = new Map<string, number>()

	for (const track of cachedTracks) {
		const occurrence = cachedCounts.get(track.id) ?? 0
		cachedCounts.set(track.id, occurrence + 1)
		cachedByOccurrence.set(`${track.id}:${occurrence}`, track)
	}

	const freshCounts = new Map<string, number>()
	return freshTracks.map(track => {
		const occurrence = freshCounts.get(track.id) ?? 0
		freshCounts.set(track.id, occurrence + 1)
		const cached = cachedByOccurrence.get(`${track.id}:${occurrence}`)

		if (!cached || !isIsoTimestamp(cached.played_at)) return track
		return {
			...track,
			played_at: cached.played_at,
			played_at_estimated: true
		}
	})
}

function getSections(data: unknown): Renderer[] {
	const contents = (data as Renderer)?.contents
		?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
		?.sectionListRenderer?.contents
	return Array.isArray(contents) ? contents : []
}

function assertAuthenticatedResponse(sections: Renderer[]) {
	for (const section of sections) {
		const messages = section?.itemSectionRenderer?.contents
		if (!Array.isArray(messages)) continue

		for (const item of messages) {
			const message = getText(item?.messageRenderer?.text)
			if (/sign in/i.test(message)) {
				throw new YTMusicUnauthorizedError(message)
			}
		}
	}
}

function getVideoId(item: Renderer): string {
	return (
		item?.overlay?.musicItemThumbnailOverlayRenderer?.content
			?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
			?.videoId ?? ''
	)
}

function getFlexColumnText(item: Renderer, index: number): string {
	return getText(
		item?.flexColumns?.[index]?.musicResponsiveListItemFlexColumnRenderer
			?.text
	)
}

function getText(textRenderer: Renderer | undefined): string {
	if (!Array.isArray(textRenderer?.runs)) return ''
	return textRenderer.runs
		.map((run: Renderer) => run?.text?.trim())
		.filter(Boolean)
		.join(' ')
}

function extractArtists(item: Renderer): string {
	const runs =
		item?.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text
			?.runs
	if (!Array.isArray(runs)) return ''

	return runs
		.map((run: Renderer) => run?.text?.trim())
		.filter((text: string | undefined) => {
			if (!text || text === '•' || text === '/') return false
			if (text.includes('/') || text.startsWith('Album')) return false
			return !/\d+(\.\d+)?[KMB]?\s*views?/i.test(text)
		})
		.join(', ')
}

function extractThumbnail(item: Renderer): string {
	const thumbnails =
		item?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
	if (!Array.isArray(thumbnails) || thumbnails.length === 0) return ''
	return thumbnails.at(-1)?.url ?? ''
}

function estimatePlayedAt(label: string, index: number, now: Date): string {
	const lowerLabel = label.toLowerCase()
	const estimate = new Date(now)

	if (lowerLabel.includes('yesterday')) {
		estimate.setUTCDate(estimate.getUTCDate() - 1)
		estimate.setUTCHours(12, 0, 0, 0)
	} else {
		estimate.setTime(
			estimate.getTime() - index * APPROXIMATE_TRACK_SPACING_MS
		)
	}

	return estimate.toISOString()
}

function isIsoTimestamp(value: string): boolean {
	return !Number.isNaN(Date.parse(value))
}
