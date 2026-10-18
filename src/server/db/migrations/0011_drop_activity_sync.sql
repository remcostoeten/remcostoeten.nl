ALTER TABLE "spotify_listens" DROP CONSTRAINT IF EXISTS "spotify_listens_linked_activity_id_github_activities_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "spotify_listens_linked_idx";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN IF EXISTS "linked_activity_id";--> statement-breakpoint
DROP TABLE IF EXISTS "github_activities" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "sync_metadata" CASCADE;
