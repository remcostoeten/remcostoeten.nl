import { pgTable, text, index, integer, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, createdTimestamp } from './helpers'

export const spotifyListens = pgTable(
	'spotify_listens',
	{
		...primaryId,
		trackId: text('track_id').notNull(),
		trackName: text('track_name').notNull(),
		artistName: text('artist_name').notNull(),
		albumName: text('album_name'),
		albumImage: text('album_image'),
		trackUrl: text('track_url').notNull(),
		durationMs: integer('duration_ms'),
		playedAt: timestamp('played_at').notNull().unique(),
		...createdTimestamp
	},
	t => [
		index('spotify_listens_played_at_idx').on(t.playedAt),
		index('spotify_listens_track_idx').on(t.trackId),
		index('spotify_listens_artist_idx').on(t.artistName)
	]
)

export type SpotifyListen = typeof spotifyListens.$inferSelect
export type NewSpotifyListen = typeof spotifyListens.$inferInsert
