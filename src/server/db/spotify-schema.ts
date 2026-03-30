import { pgTable, text, index, integer, timestamp } from 'drizzle-orm/pg-core'
import { githubActivities } from './github-schema'
import { primaryId, createdTimestamp, timestamps } from './helpers'

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
		linkedActivityId: text('linked_activity_id').references(
			() => githubActivities.id,
			{ onDelete: 'set null' }
		),
		...createdTimestamp
	},
	t => [
		index('spotify_listens_played_at_idx').on(t.playedAt),
		index('spotify_listens_track_idx').on(t.trackId),
		index('spotify_listens_artist_idx').on(t.artistName),
		index('spotify_listens_linked_idx').on(t.linkedActivityId)
	]
)

export const syncMetadata = pgTable('sync_metadata', {
	service: text('service').primaryKey(),
	lastSyncAt: timestamp('last_sync_at').notNull(),
	lastEventId: text('last_event_id'),
	syncCount: integer('sync_count').default(0).notNull(),
	...timestamps
})

export type SpotifyListen = typeof spotifyListens.$inferSelect
export type NewSpotifyListen = typeof spotifyListens.$inferInsert
export type SyncMetadata = typeof syncMetadata.$inferSelect
