import { unstable_cache } from 'next/cache'
import { fetchInnertube, hasYTMusicCredentials } from './auth'
import {
	hasOAuthCredentials,
	getPythonYTMusicTracks,
	getLocalServerTracks
} from './python-bridge'
import type { YTMusicTrack } from '@/features/ytmusic/types'
import { db } from '@/server/db/connection'
import { ytmusicCache } from '@/server/db/ytmusic-schema'
import { eq } from 'drizzle-orm'

const YTM_BASE = 'https://music.youtube.com'
const MAX_DETECTED_TRACKS = 500
const DB_CACHE_KEY = 'recent'

let lastSeenIds: Set<string> = new Set()
let firstSeenAt: Map<string, string> = new Map()

async function readDbCache(): Promise<YTMusicTrack[]> {
	try {
		const row = await db.query.ytmusicCache.findFirst({
			where: eq(ytmusicCache.key, DB_CACHE_KEY)
		})
		return row?.tracks ?? []
	} catch {
		return []
	}
}

async function writeDbCache(tracks: YTMusicTrack[]): Promise<void> {
	try {
		await db
			.insert(ytmusicCache)
			.values({ key: DB_CACHE_KEY, tracks, updatedAt: new Date() })
			.onConflictDoUpdate({
				target: ytmusicCache.key,
				set: { tracks, updatedAt: new Date() }
			})
	} catch {}
}

function formatPythonTracks(tracks: YTMusicTrack[]): YTMusicTrack[] {
	const now = Date.now()
	return tracks.map((track, i) => ({
		...track,
		played_at: track.played_at || new Date(now - i * 180_000).toISOString()
	}))
}

export const getYTMusicTracks = unstable_cache(
	async (limit: number): Promise<YTMusicTrack[]> => {
		let result: YTMusicTrack[] = []

		try {
			if (hasYTMusicCredentials()) {
				const data = await fetchInnertube('browse', {
					browseId: 'FEmusic_history'
				})

				const contents = traverse(
					data,
					'contents',
					'singleColumnBrowseResultsRenderer',
					'tabs',
					'0',
					'tabRenderer',
					'content',
					'sectionListRenderer',
					'contents'
				) as any[] | undefined
				if (Array.isArray(contents) && contents.length > 0) {
					result = parseInnertubeTracks(contents, limit)
				}
			}

			if (result.length === 0) {
				const localTracks = await getLocalServerTracks(limit)
				if (localTracks.length > 0) result = localTracks
			}

			if (result.length === 0 && hasOAuthCredentials()) {
				const tracks = getPythonYTMusicTracks(limit)
				if (tracks.length > 0) result = formatPythonTracks(tracks)
			}

			if (result.length > 0) {
				await writeDbCache(result)
				return result
			}
		} catch (error) {
			console.error('[YTM Tracks] Error:', error)
			const localTracks = await getLocalServerTracks(limit)
			if (localTracks.length > 0) {
				result = localTracks
				await writeDbCache(result)
				return result
			}
			if (hasOAuthCredentials()) {
				const tracks = getPythonYTMusicTracks(limit)
				if (tracks.length > 0) {
					result = formatPythonTracks(tracks)
					await writeDbCache(result)
					return result
				}
			}
		}

		const cached = await readDbCache()
		if (cached.length > 0) return cached.slice(0, limit)
		return []
	},
	['ytmusic-recent-v2'],
	{ revalidate: 30, tags: ['ytmusic'] }
)

function parseInnertubeTracks(contents: any[], limit: number): YTMusicTrack[] {
	const rawTracks: any[] = []
	for (const section of contents) {
		const shelf =
			section?.musicShelfRenderer ?? section?.musicCarouselShelfRenderer
		if (shelf?.contents) {
			rawTracks.push(...shelf.contents)
		}
	}

	if (!rawTracks.length) return []

	const freshIds = new Set<string>()
	const result: YTMusicTrack[] = []
	const now = Date.now()

	for (let i = 0; i < rawTracks.length; i++) {
		if (result.length >= limit) break

		const item = rawTracks[i]?.musicResponsiveListItemRenderer
		if (!item) continue

		const id = traverse(
			item,
			'overlay',
			'musicItemThumbnailOverlayRenderer',
			'content',
			'musicPlayButtonRenderer',
			'playNavigationEndpoint',
			'watchEndpoint',
			'videoId'
		) as string | undefined
		const title = traverse(
			item,
			'flexColumns',
			'0',
			'musicResponsiveListItemFlexColumnRenderer',
			'text',
			'runs',
			'0',
			'text'
		) as string | undefined

		if (!id || !title) continue

		freshIds.add(id)

		if (!firstSeenAt.has(id)) {
			firstSeenAt.set(id, new Date(now - i * 180_000).toISOString())
		}

		if (firstSeenAt.size > MAX_DETECTED_TRACKS) {
			const keys = firstSeenAt.keys()
			for (let j = 0; j < 100; j++) {
				const key = keys.next()
				if (key.done) break
				if (!freshIds.has(key.value)) {
					firstSeenAt.delete(key.value)
				}
			}
		}

		const artists = extractArtists(item)
		const album = extractAlbum(item)
		const thumbnail = extractThumbnail(item)

		result.push({
			id,
			name: title,
			artist: artists || 'Unknown',
			album: album || '',
			url: `${YTM_BASE}/watch?v=${id}`,
			image: thumbnail || '',
			played_at: firstSeenAt.get(id)!
		})
	}

	lastSeenIds = freshIds
	return result
}

function traverse(obj: unknown, ...keys: string[]): unknown {
	if (!obj || typeof obj !== 'object') return undefined
	let current: any = obj
	for (const key of keys) {
		if (key === '*') {
			if (Array.isArray(current)) {
				for (const item of current) {
					const result = traverse(
						item,
						...keys.slice(keys.indexOf('*') + 1)
					)
					if (result !== undefined) return result
				}
				return undefined
			}
			return undefined
		}
		if (current == null || typeof current !== 'object') return undefined
		if (Array.isArray(current)) {
			const idx = parseInt(key, 10)
			if (isNaN(idx)) return undefined
			current = current[idx]
		} else {
			current = (current as Record<string, any>)[key]
		}
	}
	return current
}

function extractArtists(item: any): string {
	const runs = traverse(
		item,
		'flexColumns',
		'1',
		'musicResponsiveListItemFlexColumnRenderer',
		'text',
		'runs'
	) as any[] | undefined
	if (!Array.isArray(runs)) return ''

	const names: string[] = []
	for (const run of runs) {
		const text = run?.text?.trim()
		if (
			!text ||
			text === '•' ||
			text === '/' ||
			text.includes('/') ||
			text.startsWith('Album') ||
			/\d+(\.\d+)?[KMB]?\s*views?/i.test(text)
		)
			continue
		names.push(text)
	}

	return names.join(', ')
}

function extractAlbum(item: any): string {
	const album = traverse(
		item,
		'flexColumns',
		'2',
		'musicResponsiveListItemFlexColumnRenderer',
		'text',
		'runs',
		'0',
		'text'
	) as string | undefined
	return album || ''
}

function extractThumbnail(item: any): string {
	const thumbnails = traverse(
		item,
		'thumbnail',
		'musicThumbnailRenderer',
		'thumbnail',
		'thumbnails'
	) as any[] | undefined
	if (!Array.isArray(thumbnails) || !thumbnails.length) return ''
	const last = thumbnails[thumbnails.length - 1]
	return last?.url || ''
}
