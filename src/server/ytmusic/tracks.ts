import type { YTMusicResult, YTMusicTrack } from '@/features/ytmusic/types'
import { fetchInnertube, hasYTMusicCredentials } from './auth'
import { readYTMusicCache, writeYTMusicCache } from './cache'
import {
	parseInnertubeTracks,
	stabilizeTrackTimestamps,
	YTMusicUnauthorizedError
} from './parser'

const FRESH_CACHE_MS = 30_000
const MAX_CACHED_TRACKS = 50

interface GetYTMusicOptions {
	forceRefresh?: boolean
}

export async function getYTMusicResult(
	limit: number,
	{ forceRefresh = false }: GetYTMusicOptions = {}
): Promise<YTMusicResult> {
	const fetchedAt = new Date().toISOString()
	const credentialsConfigured = hasYTMusicCredentials()
	const cache = await readYTMusicCache()
	const cachedTracks = cache?.tracks.slice(0, limit) ?? []
	const cacheUpdatedAt = cache?.updatedAt.toISOString() ?? null
	const cacheIsFresh = cache
		? Date.now() - cache.updatedAt.getTime() < FRESH_CACHE_MS
		: false

	if (!forceRefresh && cacheIsFresh && cachedTracks.length > 0) {
		return createResult({
			status: 'ok',
			source: 'database',
			tracks: cachedTracks,
			message: 'Serving the latest saved YouTube Music response.',
			credentialsConfigured,
			isStale: false,
			fetchedAt,
			cacheUpdatedAt
		})
	}

	if (!credentialsConfigured) {
		if (cachedTracks.length > 0) {
			return createStaleResult(
				cachedTracks,
				fetchedAt,
				cacheUpdatedAt,
				'Live access is not configured. Showing the last saved response.'
			)
		}

		return createResult({
			status: 'unconfigured',
			source: 'none',
			tracks: [],
			message: 'Set YTM_COOKIE to connect YouTube Music.',
			credentialsConfigured: false,
			isStale: false,
			fetchedAt,
			cacheUpdatedAt: null
		})
	}

	try {
		const data = await fetchInnertube('browse', {
			browseId: 'FEmusic_history'
		})
		const parsedTracks = parseInnertubeTracks(data, MAX_CACHED_TRACKS)
		const allTracks = stabilizeTrackTimestamps(
			parsedTracks,
			cache?.tracks ?? []
		)

		if (allTracks.length === 0) {
			return createResult({
				status: 'empty',
				source: 'youtube-music',
				tracks: [],
				message: 'YouTube Music returned an empty listening history.',
				credentialsConfigured: true,
				isStale: false,
				fetchedAt,
				cacheUpdatedAt
			})
		}

		const updatedAt = await writeYTMusicCache(allTracks)
		return createResult({
			status: 'ok',
			source: 'youtube-music',
			tracks: allTracks.slice(0, limit),
			message: 'Live listening history received from YouTube Music.',
			credentialsConfigured: true,
			isStale: false,
			fetchedAt,
			cacheUpdatedAt: updatedAt?.toISOString() ?? cacheUpdatedAt
		})
	} catch (error) {
		const unauthorized = error instanceof YTMusicUnauthorizedError
		const message = unauthorized
			? 'YouTube Music rejected the session. Replace YTM_COOKIE with a fresh browser cookie.'
			: 'YouTube Music could not be reached.'

		if (!unauthorized) {
			console.error('[YTM Tracks]', message, error)
		}
		if (cachedTracks.length > 0) {
			return createStaleResult(
				cachedTracks,
				fetchedAt,
				cacheUpdatedAt,
				`${message} Showing the last saved response.`
			)
		}

		return createResult({
			status: unauthorized ? 'unauthorized' : 'error',
			source: 'none',
			tracks: [],
			message,
			credentialsConfigured: true,
			isStale: false,
			fetchedAt,
			cacheUpdatedAt
		})
	}
}

export async function getYTMusicTracks(limit: number): Promise<YTMusicTrack[]> {
	const result = await getYTMusicResult(limit)
	return result.tracks
}

function createStaleResult(
	tracks: YTMusicTrack[],
	fetchedAt: string,
	cacheUpdatedAt: string | null,
	message: string
): YTMusicResult {
	return createResult({
		status: 'stale',
		source: 'database',
		tracks,
		message,
		credentialsConfigured: hasYTMusicCredentials(),
		isStale: true,
		fetchedAt,
		cacheUpdatedAt
	})
}

function createResult(result: YTMusicResult): YTMusicResult {
	return result
}
