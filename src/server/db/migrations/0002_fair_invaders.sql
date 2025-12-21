CREATE TABLE "blog_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" text,
	"content" text NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_abandonments" (
	"id" text PRIMARY KEY NOT NULL,
	"visitor_id" text NOT NULL,
	"interaction_id" text,
	"time_to_abandon" integer,
	"last_field_touched" text,
	"form_data" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_interactions" (
	"id" text PRIMARY KEY NOT NULL,
	"visitor_id" text NOT NULL,
	"interaction_type" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_reactions" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_abandonments" ADD CONSTRAINT "contact_abandonments_interaction_id_contact_interactions_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "public"."contact_interactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_comments_slug_idx" ON "blog_comments" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_comments_user_idx" ON "blog_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blog_comments_parent_idx" ON "blog_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "contact_abandonments_interaction_idx" ON "contact_abandonments" USING btree ("interaction_id");--> statement-breakpoint
CREATE INDEX "contact_abandonments_visitor_idx" ON "contact_abandonments" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "contact_abandonments_time_idx" ON "contact_abandonments" USING btree ("time_to_abandon");--> statement-breakpoint
CREATE INDEX "contact_interactions_type_idx" ON "contact_interactions" USING btree ("interaction_type");--> statement-breakpoint
CREATE INDEX "contact_interactions_visitor_idx" ON "contact_interactions" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "contact_interactions_session_idx" ON "contact_interactions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "contact_interactions_created_idx" ON "contact_interactions" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "blog_reactions" ADD CONSTRAINT "blog_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_reactions_user_idx" ON "blog_reactions" USING btree ("user_id");