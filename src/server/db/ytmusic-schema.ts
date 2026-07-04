import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import type { YTMusicTrack } from '@/features/ytmusic/types'

export const ytmusicCache = pgTable('ytmusic_cache', {
	key: text('key').primaryKey(),
	tracks: jsonb('tracks').$type<YTMusicTrack[]>().notNull().default([]),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export type YTMusicCache = typeof ytmusicCache.$inferSelect
