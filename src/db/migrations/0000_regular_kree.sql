CREATE TABLE "admin_activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"module" varchar(50) NOT NULL,
	"details" jsonb,
	"ip_address" varchar(45),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "admin_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"page" varchar(255),
	"referrer" varchar(500),
	"user_agent" text,
	"ip_address" varchar(45),
	"session_id" varchar(255),
	"user_id" varchar(255),
	"data" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"country" varchar(100),
	"region" varchar(100),
	"city" varchar(100),
	"latitude" varchar(50),
	"longitude" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255),
	"message" text NOT NULL,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"location" varchar(255),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_current" boolean DEFAULT false NOT NULL,
	"description" text NOT NULL,
	"achievements" jsonb,
	"technologies" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" varchar(500) NOT NULL,
	"alt" varchar(255) NOT NULL,
	"caption" text,
	"is_hero" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"long_description" text,
	"url" varchar(500),
	"demo_url" varchar(500),
	"github_url" varchar(500),
	"technologies" jsonb NOT NULL,
	"category" varchar(100) NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"highlights" jsonb NOT NULL,
	"metrics" jsonb,
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"proficiency" integer NOT NULL,
	"years_of_experience" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "admin_activity_log" ADD CONSTRAINT "admin_activity_log_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_activity_user_idx" ON "admin_activity_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_activity_module_idx" ON "admin_activity_log" USING btree ("module");--> statement-breakpoint
CREATE INDEX "admin_activity_timestamp_idx" ON "admin_activity_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "admin_sessions_token_idx" ON "admin_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "admin_sessions_expires_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "analytics_event_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_timestamp_idx" ON "analytics_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "analytics_page_idx" ON "analytics_events" USING btree ("page");--> statement-breakpoint
CREATE INDEX "analytics_user_id_idx" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contact_status_idx" ON "contact_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_read_idx" ON "contact_submissions" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_published_idx" ON "projects" USING btree ("is_published");