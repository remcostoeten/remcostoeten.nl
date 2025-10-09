-- Drop the old blog_views table with incorrect schema
DROP TABLE IF EXISTS "blog_views" CASCADE;

-- Create blog_views table with correct schema
CREATE TABLE "blog_views" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"session_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	CONSTRAINT "blog_views_session_id_slug_unique" UNIQUE("session_id","slug")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_blog_views_slug" ON "blog_views" ("slug");
CREATE INDEX IF NOT EXISTS "idx_blog_views_session_id" ON "blog_views" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_blog_views_timestamp" ON "blog_views" ("timestamp");
CREATE INDEX IF NOT EXISTS "idx_blog_views_created_at" ON "blog_views" ("created_at");
