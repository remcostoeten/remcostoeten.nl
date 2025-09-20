CREATE TABLE "blog_analytics" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"recent_views" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	CONSTRAINT "blog_analytics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"read_time" integer NOT NULL,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"author" text,
	"seo" json,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NOW() NOT NULL,
	CONSTRAINT "blog_metadata_slug_unique" UNIQUE("slug")
);
