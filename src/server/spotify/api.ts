import { getSpotifyAccessToken, hasSpotifyCredentials } from './auth'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export type SpotifyApiArtist = {
	id: string
	name: string
	genres: string[]
	images: Array<{ url: string }>
}

export type SpotifyApiTrack = {
	id: string
	name: string
	duration_ms: number
	explicit: boolean
	is_local: boolean
	external_urls: { spotify: string }
	artists: Array<{ id: string; name: string }>
	album: { id: string; name: string; images: Array<{ url: string }> }
}

export type SpotifyPlayHistoryItem = {
	played_at: string
	track: SpotifyApiTrack
	context: { type: string; uri: string } | null
}

async function spotifyGet<Body>(path: string): Promise<Body | null> {
	if (!hasSpotifyCredentials()) return null

	const accessToken = await getSpotifyAccessToken()
	if (!accessToken) return null

	const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	})

	if (!response.ok) return null

	return response.json()
}

/**
 * @name fetchRecentlyPlayed
 * @description Fetches up to 50 entries of the account's recently played
 * history, newest first. Returns null when credentials are missing, the token
 * refresh fails or Spotify responds with an error.
 *
 * @example
 * const items = await fetchRecentlyPlayed(50)
 * if (items) console.log(items[0]?.track.name)
 */
export async function fetchRecentlyPlayed(limit: number) {
	const body = await spotifyGet<{ items?: SpotifyPlayHistoryItem[] }>(
		`/me/player/recently-played?limit=${limit}`
	)

	return body ? (body.items ?? []) : null
}

/**
 * @name fetchTracks
 * @description Fetches full track objects for up to 50 Spotify track IDs. Unknown
 * IDs come back as null in their position. Returns null when Spotify cannot be
 * reached.
 *
 * @example
 * const tracks = await fetchTracks(['3n3Ppam7vgaVa1iaRUc9Lp'])
 */
export async function fetchTracks(ids: string[]) {
	const body = await spotifyGet<{ tracks: Array<SpotifyApiTrack | null> }>(
		`/tracks?ids=${ids.join(',')}`
	)

	return body?.tracks ?? null
}

/**
 * @name fetchArtists
 * @description Fetches full artist objects, including genres and images, for
 * up to 50 Spotify artist IDs. Unknown IDs come back as null in their
 * position. Returns null when Spotify cannot be reached.
 *
 * @example
 * const artists = await fetchArtists(['0OdUWJ0sBjDrqHygGUXeCF'])
 */
export async function fetchArtists(ids: string[]) {
	const body = await spotifyGet<{ artists: Array<SpotifyApiArtist | null> }>(
		`/artists?ids=${ids.join(',')}`
	)

	return body?.artists ?? null
}
