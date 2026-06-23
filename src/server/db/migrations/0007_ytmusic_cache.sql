CREATE TABLE "ytmusic_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"tracks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "additional_desc" text;