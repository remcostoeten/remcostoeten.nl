CREATE TABLE "blog_link_clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"visitor_id" text NOT NULL,
	"session_id" text,
	"link_href" text NOT NULL,
	"link_text" text,
	"is_internal" boolean DEFAULT true NOT NULL,
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"slug" text PRIMARY KEY NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_reactions" (
	"slug" text NOT NULL,
	"emoji" text NOT NULL,
	"visitor_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_reactions_slug_emoji_visitor_id_pk" PRIMARY KEY("slug","emoji","visitor_id")
);
--> statement-breakpoint
CREATE TABLE "blog_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"visitor_id" text NOT NULL,
	"time_on_page" integer,
	"scroll_depth" real,
	"reached_end" boolean DEFAULT false NOT NULL,
	"device" text,
	"referrer" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "github_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"repository" text NOT NULL,
	"url" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"event_date" timestamp NOT NULL,
	"payload" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "github_activities_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "spotify_listens" (
	"id" text PRIMARY KEY NOT NULL,
	"track_id" text NOT NULL,
	"track_name" text NOT NULL,
	"artist_name" text NOT NULL,
	"album_name" text,
	"album_image" text,
	"track_url" text NOT NULL,
	"duration_ms" integer,
	"played_at" timestamp NOT NULL,
	"linked_activity_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "spotify_listens_played_at_unique" UNIQUE("played_at")
);
--> statement-breakpoint
CREATE TABLE "sync_metadata" (
	"service" text PRIMARY KEY NOT NULL,
	"last_sync_at" timestamp NOT NULL,
	"last_event_id" text,
	"sync_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_link_clicks" ADD CONSTRAINT "blog_link_clicks_session_id_blog_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."blog_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotify_listens" ADD CONSTRAINT "spotify_listens_linked_activity_id_github_activities_id_fk" FOREIGN KEY ("linked_activity_id") REFERENCES "public"."github_activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_link_clicks_slug_idx" ON "blog_link_clicks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_posts_draft_idx" ON "blog_posts" USING btree ("is_draft");--> statement-breakpoint
CREATE INDEX "blog_reactions_slug_idx" ON "blog_reactions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_sessions_slug_idx" ON "blog_sessions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_sessions_visitor_idx" ON "blog_sessions" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "github_activities_event_id_idx" ON "github_activities" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "github_activities_date_idx" ON "github_activities" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "github_activities_type_idx" ON "github_activities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "github_activities_repo_idx" ON "github_activities" USING btree ("repository");--> statement-breakpoint
CREATE INDEX "spotify_listens_played_at_idx" ON "spotify_listens" USING btree ("played_at");--> statement-breakpoint
CREATE INDEX "spotify_listens_track_idx" ON "spotify_listens" USING btree ("track_id");--> statement-breakpoint
CREATE INDEX "spotify_listens_artist_idx" ON "spotify_listens" USING btree ("artist_name");--> statement-breakpoint
CREATE INDEX "spotify_listens_linked_idx" ON "spotify_listens" USING btree ("linked_activity_id");