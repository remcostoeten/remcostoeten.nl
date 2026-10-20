ALTER TABLE "spotify_listens" DROP CONSTRAINT "spotify_listens_played_at_unique";--> statement-breakpoint
DROP INDEX "spotify_listens_artist_idx";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN "track_name";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN "artist_name";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN "album_name";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN "album_image";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN "track_url";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN "duration_ms";