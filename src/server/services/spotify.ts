export type SpotifyTrack = {
	id: string
	name: string
	artist: string
	album: string
	url: string
	image: string
	played_at: string
}

const FALLBACK_TRACKS: SpotifyTrack[] = [
	{
		id: '1',
		name: 'Blinding Lights',
		artist: 'The Weeknd',
		album: 'After Hours',
		url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
		image: 'https://i.scdn.co/image/ab67616d0000b27351b6c9225ea311fa4271a77d',
		played_at: new Date().toISOString()
	},
	{
		id: '2',
		name: 'Levitating',
		artist: 'Dua Lipa',
		album: 'Future Nostalgia',
		url: 'https://open.spotify.com/track/5yUbyW1MfxqBc0ZkUp1xNG',
		image: 'https://i.scdn.co/image/ab67616d0000b2738d2b0c5a3c0eaedaece0a5c5',
		played_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
	},
	{
		id: '3',
		name: 'Heat Waves',
		artist: 'Glass Animals',
		album: 'Dreamland',
		url: 'https://open.spotify.com/track/7Li6WYFTpGI6XnfVDbCxxt',
		image: 'https://i.scdn.co/image/ab67616d0000b273a3c5de4def32adba8d8783a8',
		played_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
	}
]

export async function getLatestTracks(limit = 10): Promise<SpotifyTrack[]> {
	try {
		console.log('🎵 Fetching Spotify tracks from API...')

		const response = await fetch(`/api/spotify/recent?limit=${limit}`)

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			console.warn(
				'🎵 Spotify API error:',
				errorData.error || 'Unknown error'
			)

			if (errorData.error === 'No refresh token configured') {
				console.log('🎵 No Spotify token, trying mock data...')
				try {
					const mockResponse = await fetch('/api/spotify.json')
					if (mockResponse.ok) {
						const mockData = await mockResponse.json()
						if (mockData.tracks && mockData.tracks.length > 0) {
							console.log(
								'✅ Using mock Spotify tracks:',
								mockData.tracks.length
							)
							return mockData.tracks
						}
					}
				} catch (mockError) {
					console.log(
						'🎵 Mock data not available, using hardcoded fallback'
					)
				}
			}

			return FALLBACK_TRACKS
		}

		const data = await response.json()

		if (data.tracks && data.tracks.length > 0) {
			console.log(
				'✅ Successfully fetched real Spotify tracks:',
				data.tracks.length
			)
			return data.tracks
		}

		console.log('No recent tracks found, using fallback')
		return FALLBACK_TRACKS
	} catch (error) {
		console.error('🎵 Error fetching Spotify tracks:', error)

		try {
			console.log('🎵 Network error, trying mock data...')
			const mockResponse = await fetch('/api/spotify.json')
			if (mockResponse.ok) {
				const mockData = await mockResponse.json()
				if (mockData.tracks && mockData.tracks.length > 0) {
					console.log(
						'✅ Using mock Spotify tracks:',
						mockData.tracks.length
					)
					return mockData.tracks
				}
			}
		} catch (mockError) {
			console.log(
				'🎵 Mock data not available either, using hardcoded fallback'
			)
		}

		return FALLBACK_TRACKS
	}
}

export type NowPlaying = {
	isPlaying: boolean
	track: SpotifyTrack | null
	progress_ms: number
	duration_ms: number
}

export async function getNowPlaying(): Promise<NowPlaying> {
	try {
		const response = await fetch('/api/spotify/now-playing')
		if (!response.ok) {
			return {
				isPlaying: false,
				track: null,
				progress_ms: 0,
				duration_ms: 0
			}
		}
		const data = await response.json()
		return {
			isPlaying: data.isPlaying,
			track: data.track || null,
			progress_ms: data.progress_ms || 0,
			duration_ms: data.duration_ms || 0
		}
	} catch (error) {
		console.error('Error fetching now playing:', error)
		return { isPlaying: false, track: null, progress_ms: 0, duration_ms: 0 }
	}
}

export type CurrentPlayback = {
	track: SpotifyTrack | null
	progress_ms: number
	duration_ms: number
	is_playing: boolean
	timestamp: number // Server timestamp when data was fetched
}

/**
 * Get current playback state for real-time monitoring
 * Returns null if nothing is playing
 */
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

export function getRelativeTime(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMins / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffMins < 1) return 'just now'
	if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
	if (diffHours < 24)
		return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
	return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}
