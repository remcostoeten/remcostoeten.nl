import { unstable_cache } from 'next/cache'
import { desc } from 'drizzle-orm'
import { db, schema } from '@/server/db/connection'
import {
	getSpotifyAccessToken,
	hasSpotifyCredentials
} from '@/server/spotify/auth'
import type { SpotifyTrack } from './types'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export const getStoredSpotifyTracks = unstable_cache(
	async (limit: number): Promise<SpotifyTrack[]> => {
		try {
			const storedTracks = await db.query.spotifyListens.findMany({
				orderBy: desc(schema.spotifyListens.playedAt),
				limit
			})

			return storedTracks.map(track => ({
				id: track.trackId,
				name: track.trackName,
				artist: track.artistName,
				album: track.albumName || '',
				url: track.trackUrl,
				image: track.albumImage || '',
				played_at: track.playedAt.toISOString()
			}))
		} catch (error) {
			console.error('Error fetching stored Spotify tracks:', error)
			return []
		}
	},
	['spotify-stored-recent'],
	{ revalidate: 300, tags: ['spotify'] }
)

/**
 * @name fetchRecentSpotifyTracks
 * @description Fetches the most recently played tracks from the Spotify API,
 * newest first. Returns null when credentials are missing, the token refresh
 * fails or Spotify responds with an error.
 *
 * @example
 * const tracks = await fetchRecentSpotifyTracks(50)
 * if (tracks) console.log(tracks[0]?.name)
 */
export async function fetchRecentSpotifyTracks(
	limit: number
): Promise<SpotifyTrack[] | null> {
	if (!hasSpotifyCredentials()) return null

	const accessToken = await getSpotifyAccessToken()
	if (!accessToken) return null

	const response = await fetch(
		`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
		{
			headers: { Authorization: `Bearer ${accessToken}` }
		}
	)

	if (!response.ok) return null

	const data = await response.json()
	return (
		data.items?.map((item: any) => ({
			id: item.track.id,
			name: item.track.name,
			artist: item.track.artists.map((a: any) => a.name).join(', '),
			album: item.track.album.name,
			url: item.track.external_urls.spotify,
			image: item.track.album.images[0]?.url || '',
			played_at: item.played_at
		})) || []
	)
}

export const getSpotifyTracks = unstable_cache(
	async (limit: number): Promise<SpotifyTrack[]> => {
		try {
			const recentTracks = await fetchRecentSpotifyTracks(limit)

			return recentTracks && recentTracks.length > 0
				? recentTracks
				: getStoredSpotifyTracks(limit)
		} catch (error) {
			console.error('Error fetching Spotify tracks:', error)
			return getStoredSpotifyTracks(limit)
		}
	},
	['spotify-recent'],
	{ revalidate: 30, tags: ['spotify'] }
)
