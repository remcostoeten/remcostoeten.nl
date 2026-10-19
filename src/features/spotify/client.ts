'use client'

import type { SpotifyTrack } from './types'

export type { SpotifyTrack } from './types'

export type CurrentPlayback = {
	track: SpotifyTrack | null
	progress_ms: number
	duration_ms: number
	is_playing: boolean
	timestamp: number
}

export async function getCurrentPlayback(): Promise<CurrentPlayback | null> {
	try {
		const response = await fetch('/api/spotify/now-playing')
		if (!response.ok) {
			return null
		}
		const data = await response.json()

		if (!data.track) {
			return null
		}

		return {
			track: data.track,
			progress_ms: data.progress_ms || 0,
			duration_ms: data.duration_ms || 0,
			is_playing: data.isPlaying || false,
			timestamp: Date.now()
		}
	} catch (error) {
		console.error('Error fetching current playback:', error)
		return null
	}
}

export function formatDuration(durationMs: number): string {
	const minutes = Math.floor(durationMs / 60000)
	const seconds = Math.floor((durationMs % 60000) / 1000)
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
