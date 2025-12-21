CREATE TABLE "blog_views" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"fingerprint" text NOT NULL,
	"visitor_id" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"geo_country" text,
	"geo_city" text,
	"geo_region" text,
	"geo_loc" text,
	"geo_org" text,
	"geo_timezone" text
);
--> statement-breakpoint
ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_slug_blog_posts_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."blog_posts"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_views_slug_idx" ON "blog_views" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_views_fingerprint_idx" ON "blog_views" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "blog_views_visitor_idx" ON "blog_views" USING btree ("visitor_id");