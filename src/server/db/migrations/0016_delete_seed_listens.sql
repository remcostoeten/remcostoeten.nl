DELETE FROM "spotify_listens" WHERE "track_id" LIKE 'seed-%';--> statement-breakpoint
DELETE FROM "spotify_tracks" WHERE "id" LIKE 'seed-%';
