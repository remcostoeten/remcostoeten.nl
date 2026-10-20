ALTER TABLE "spotify_listens" DROP CONSTRAINT "spotify_listens_linked_activity_id_github_activities_id_fk";--> statement-breakpoint
DROP INDEX "spotify_listens_linked_idx";--> statement-breakpoint
ALTER TABLE "spotify_listens" DROP COLUMN "linked_activity_id";--> statement-breakpoint
DROP TABLE "github_activities";--> statement-breakpoint
DROP TABLE "sync_metadata";
