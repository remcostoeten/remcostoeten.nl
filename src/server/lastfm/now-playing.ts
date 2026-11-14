import { unstable_cache } from 'next/cache'
import type { SpotifyTrack } from '@/features/spotify/types'
import {
	fetchLastfmScrobbles,
	fetchLastfmTrackDuration,
	hasLastfmCredentials
} from './api'
import { isNowPlaying, toTrack } from './mappers'

type NowPlaying = {
	isPlaying: boolean
	track?: SpotifyTrack
	progress_ms?: number
	duration_ms?: number
}

const getCachedTrackDuration = unstable_cache(
	fetchLastfmTrackDuration,
	['lastfm-track-duration'],
	{ revalidate: 604800 }
)

async function getTrackDuration(artist: string, track: string) {
	try {
		return await getCachedTrackDuration(artist, track)
	} catch (error) {
		console.error('Error fetching Last.fm track duration:', error)
		return null
	}
}

const getCurrentScrobble = unstable_cache(
	async () => {
		const { scrobbles } = await fetchLastfmScrobbles(2, 1)
		const current = scrobbles.find(isNowPlaying)
		if (!current) return null

		const previous = scrobbles.find(scrobble => !isNowPlaying(scrobble))
		const [durationMs, previousDurationMs] = await Promise.all([
			getTrackDuration(current.artist['#text'], current.name),
			previous
				? getTrackDuration(previous.artist['#text'], previous.name)
				: null
		])
		const startedAt =
			previous?.date && previousDurationMs
				? Number(previous.date.uts) * 1000 + previousDurationMs
				: null

		return { track: toTrack(current), durationMs, startedAt }
	},
	['lastfm-now-playing'],
	{ revalidate: 15 }
)

/**
 * @name getLastfmNowPlaying
 * @description Returns the track Last.fm reports as playing right now.
 * Last.fm has no playback position, so progress is estimated from when the
 * previous play ended. Without a plausible estimate the duration is reported
 * as 0, which hides the progress bar.
 *
 * @example
 * const { isPlaying, track } = await getLastfmNowPlaying()
 */
export async function getLastfmNowPlaying(): Promise<NowPlaying> {
	if (!hasLastfmCredentials()) return { isPlaying: false }

	const current = await getCurrentScrobble()
	if (!current) return { isPlaying: false }

	const progressMs = current.startedAt ? Date.now() - current.startedAt : -1
	const known =
		current.durationMs !== null &&
		progressMs >= 0 &&
		progressMs <= current.durationMs

	return {
		isPlaying: true,
		track: current.track,
		progress_ms: known ? progressMs : 0,
		duration_ms: known ? (current.durationMs ?? 0) : 0
	}
}
