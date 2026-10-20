import { unstable_cache } from 'next/cache'
import { desc } from 'drizzle-orm'
import { db, schema } from '@/server/db/connection'
import { fetchRecentlyPlayed, type SpotifyPlayHistoryItem } from './api'
import type { SpotifyTrack } from './types'

function toSpotifyTrack(item: SpotifyPlayHistoryItem): SpotifyTrack {
	return {
		id: item.track.id,
		name: item.track.name,
		artist: item.track.artists.map(artist => artist.name).join(', '),
		album: item.track.album.name,
		url: item.track.external_urls.spotify,
		image: item.track.album.images[0]?.url || '',
		played_at: item.played_at
	}
}

export const getStoredSpotifyTracks = unstable_cache(
	async (limit: number): Promise<SpotifyTrack[]> => {
		try {
			const listens = await db.query.spotifyListens.findMany({
				orderBy: desc(schema.spotifyListens.playedAt),
				limit,
				with: { track: true }
			})

			return listens.map(listen => ({
				id: listen.track.id,
				name: listen.track.name,
				artist: listen.track.artistName,
				album: listen.track.albumName || '',
				url: listen.track.url,
				image: listen.track.albumImage || '',
				played_at: listen.playedAt.toISOString()
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
			const items = await fetchRecentlyPlayed(limit)

			return items && items.length > 0
				? items.map(toSpotifyTrack)
				: getStoredSpotifyTracks(limit)
		} catch (error) {
			console.error('Error fetching Spotify tracks:', error)
			return getStoredSpotifyTracks(limit)
		}
	},
	['spotify-recent'],
	{ revalidate: 30, tags: ['spotify'] }
)
