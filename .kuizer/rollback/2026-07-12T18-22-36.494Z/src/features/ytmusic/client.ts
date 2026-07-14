'use client'

import type { YTMusicTrack } from './types'

export type { YTMusicTrack } from './types'

const FALLBACK_TRACKS: YTMusicTrack[] = [
	{
		id: 'dQw4w9WgXcQ',
		name: 'Never Gonna Give You Up',
		artist: 'Rick Astley',
		album: 'Whenever You Need Somebody',
		url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
		image: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
		played_at: new Date().toISOString()
	}
]

export async function getLatestYTMusicTracks(
	limit = 10
): Promise<YTMusicTrack[]> {
	try {
		const response = await fetch(`/api/ytmusic/recent?limit=${limit}`)

		if (!response.ok) {
			console.warn('[YTM] API error:', response.status)
			return FALLBACK_TRACKS
		}

		const data = await response.json()

		if (data.tracks?.length > 0) {
			return data.tracks
		}

		return FALLBACK_TRACKS
	} catch (error) {
		console.error('[YTM] Error fetching tracks:', error)
		return FALLBACK_TRACKS
	}
}
