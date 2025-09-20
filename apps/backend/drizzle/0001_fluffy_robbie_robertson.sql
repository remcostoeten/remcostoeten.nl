CREATE TABLE "pageviews" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"referrer" text,
	"user_agent" text,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT NOW() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_views" ALTER COLUMN "created_at" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "blog_views" ALTER COLUMN "updated_at" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "visitors" ALTER COLUMN "created_at" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "visitors" ALTER COLUMN "updated_at" SET DEFAULT NOW();