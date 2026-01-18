CREATE TABLE "project_settings" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"show_n" integer DEFAULT 6 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"idx" integer NOT NULL,
	"title" text NOT NULL,
	"desc" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"show_upd" boolean DEFAULT true NOT NULL,
	"demo_box" text,
	"show_live" boolean DEFAULT false NOT NULL,
	"git_url" text,
	"demo_url" text,
	"native" boolean DEFAULT false NOT NULL,
	"labels" text[] DEFAULT '{}' NOT NULL,
	"show_commits" boolean DEFAULT false NOT NULL,
	"show_first" boolean DEFAULT false NOT NULL,
	"show_latest" boolean DEFAULT true NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"default_open" boolean DEFAULT false NOT NULL,
	"show_indicator" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_idx_unique" UNIQUE("idx")
);
--> statement-breakpoint
CREATE INDEX "projects_idx_idx" ON "projects" USING btree ("idx");--> statement-breakpoint
CREATE INDEX "projects_hidden_idx" ON "projects" USING btree ("hidden");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "editor_theme";