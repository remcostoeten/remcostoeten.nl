CREATE TABLE "spotify_artists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"genres" text[] DEFAULT '{}' NOT NULL,
	"image_url" text,
	"enriched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spotify_track_artists" (
	"track_id" text NOT NULL,
	"artist_id" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "spotify_track_artists_track_id_artist_id_pk" PRIMARY KEY("track_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE "spotify_tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"artist_name" text NOT NULL,
	"album_id" text,
	"album_name" text,
	"album_image" text,
	"duration_ms" integer,
	"explicit" boolean,
	"url" text NOT NULL,
	"enriched_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spotify_listens" ADD COLUMN "ms_played" integer;--> statement-breakpoint
ALTER TABLE "spotify_listens" ADD COLUMN "context_type" text;--> statement-breakpoint
ALTER TABLE "spotify_listens" ADD COLUMN "context_uri" text;--> statement-breakpoint
ALTER TABLE "spotify_listens" ADD COLUMN "source" text DEFAULT 'api' NOT NULL;--> statement-breakpoint
ALTER TABLE "spotify_track_artists" ADD CONSTRAINT "spotify_track_artists_track_id_spotify_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."spotify_tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotify_track_artists" ADD CONSTRAINT "spotify_track_artists_artist_id_spotify_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."spotify_artists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spotify_track_artists_artist_idx" ON "spotify_track_artists" USING btree ("artist_id");--> statement-breakpoint
INSERT INTO "spotify_tracks" ("id", "name", "artist_name", "album_name", "album_image", "duration_ms", "url") SELECT DISTINCT ON ("track_id") "track_id", "track_name", "artist_name", "album_name", "album_image", "duration_ms", "track_url" FROM "spotify_listens" ORDER BY "track_id", "played_at" DESC;--> statement-breakpoint
ALTER TABLE "spotify_listens" ADD CONSTRAINT "spotify_listens_track_id_spotify_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."spotify_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spotify_listens" ADD CONSTRAINT "spotify_listens_played_track_unique" UNIQUE("played_at","track_id");