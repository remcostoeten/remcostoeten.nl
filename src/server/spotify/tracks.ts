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

export const getSpotifyTracks = unstable_cache(
	async (limit: number): Promise<SpotifyTrack[]> => {
		try {
			if (!hasSpotifyCredentials()) {
				return getStoredSpotifyTracks(limit)
			}

			const accessToken = await getSpotifyAccessToken()
			if (!accessToken) return getStoredSpotifyTracks(limit)

			const response = await fetch(
				`${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
				{
					headers: { Authorization: `Bearer ${accessToken}` }
				}
			)

			if (!response.ok) return getStoredSpotifyTracks(limit)

			const data = await response.json()
			const recentTracks: SpotifyTrack[] =
				data.items?.map((item: any) => ({
					id: item.track.id,
					name: item.track.name,
					artist: item.track.artists
						.map((a: any) => a.name)
						.join(', '),
					album: item.track.album.name,
					url: item.track.external_urls.spotify,
					image: item.track.album.images[0]?.url || '',
					played_at: item.played_at
				})) || []

			return recentTracks.length > 0
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
