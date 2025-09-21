CREATE TABLE "blog_views" (
	"id" text PRIMARY KEY NOT NULL,
	"visitor_id" text NOT NULL,
	"blog_slug" text NOT NULL,
	"blog_title" text NOT NULL,
	"view_count" integer DEFAULT 1 NOT NULL,
	"first_viewed_at" timestamp with time zone NOT NULL,
	"last_viewed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" text PRIMARY KEY NOT NULL,
	"visitor_id" text NOT NULL,
	"is_new_visitor" boolean DEFAULT true NOT NULL,
	"first_visit_at" timestamp with time zone NOT NULL,
	"last_visit_at" timestamp with time zone NOT NULL,
	"total_visits" integer DEFAULT 1 NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "visitors_visitor_id_unique" UNIQUE("visitor_id")
);
