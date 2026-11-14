import { unstable_cache } from 'next/cache'
import { desc } from 'drizzle-orm'
import { db, schema } from '@/server/db/connection'
import { fetchLastfmScrobbles, hasLastfmCredentials } from '@/server/lastfm/api'
import { isNowPlaying, toTrack } from '@/server/lastfm/mappers'
import type { SpotifyTrack } from './types'

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
	{ revalidate: 1800, tags: ['spotify'] }
)

export const getSpotifyTracks = unstable_cache(
	async (limit: number): Promise<SpotifyTrack[]> => {
		if (!hasLastfmCredentials()) return getStoredSpotifyTracks(limit)

		try {
			const { scrobbles } = await fetchLastfmScrobbles(limit + 1, 1)
			const tracks = scrobbles
				.filter(scrobble => !isNowPlaying(scrobble))
				.slice(0, limit)
				.map(toTrack)

			return tracks.length > 0 ? tracks : getStoredSpotifyTracks(limit)
		} catch (error) {
			console.error('Error fetching Last.fm tracks:', error)
			return getStoredSpotifyTracks(limit)
		}
	},
	['spotify-recent'],
	{ revalidate: 300, tags: ['spotify'] }
)
