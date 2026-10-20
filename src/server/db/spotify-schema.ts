import { relations } from 'drizzle-orm'
import {
	pgTable,
	text,
	index,
	integer,
	timestamp,
	boolean,
	primaryKey,
	unique
} from 'drizzle-orm/pg-core'
import { primaryId, createdTimestamp } from './helpers'

export const SPOTIFY_LISTEN_SOURCES = ['api', 'export'] as const
export type SpotifyListenSource = (typeof SPOTIFY_LISTEN_SOURCES)[number]

export const spotifyArtists = pgTable('spotify_artists', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	genres: text('genres').array().default([]).notNull(),
	imageUrl: text('image_url'),
	enrichedAt: timestamp('enriched_at'),
	...createdTimestamp
})

export const spotifyTracks = pgTable('spotify_tracks', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	artistName: text('artist_name').notNull(),
	albumId: text('album_id'),
	albumName: text('album_name'),
	albumImage: text('album_image'),
	durationMs: integer('duration_ms'),
	explicit: boolean('explicit'),
	url: text('url').notNull(),
	enrichedAt: timestamp('enriched_at'),
	...createdTimestamp
})

export const spotifyTrackArtists = pgTable(
	'spotify_track_artists',
	{
		trackId: text('track_id')
			.notNull()
			.references(() => spotifyTracks.id, { onDelete: 'cascade' }),
		artistId: text('artist_id')
			.notNull()
			.references(() => spotifyArtists.id, { onDelete: 'cascade' }),
		position: integer('position').notNull()
	},
	t => [
		primaryKey({ columns: [t.trackId, t.artistId] }),
		index('spotify_track_artists_artist_idx').on(t.artistId)
	]
)

export const spotifyListens = pgTable(
	'spotify_listens',
	{
		...primaryId,
		trackId: text('track_id')
			.notNull()
			.references(() => spotifyTracks.id),
		playedAt: timestamp('played_at').notNull(),
		msPlayed: integer('ms_played'),
		contextType: text('context_type'),
		contextUri: text('context_uri'),
		source: text('source')
			.$type<SpotifyListenSource>()
			.default('api')
			.notNull(),
		...createdTimestamp
	},
	t => [
		unique('spotify_listens_played_track_unique').on(t.playedAt, t.trackId),
		index('spotify_listens_played_at_idx').on(t.playedAt),
		index('spotify_listens_track_idx').on(t.trackId)
	]
)

export const spotifyListensRelations = relations(spotifyListens, ({ one }) => ({
	track: one(spotifyTracks, {
		fields: [spotifyListens.trackId],
		references: [spotifyTracks.id]
	})
}))
