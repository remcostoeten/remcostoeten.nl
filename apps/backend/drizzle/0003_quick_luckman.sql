CREATE TABLE "blog_feedback" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blog_feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"message" text,
	"url" text,
	"user_agent" text,
	"ip_hash" varchar(64),
	"fingerprint" varchar(64),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "blog_feedback_slug_idx" ON "blog_feedback" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_feedback_timestamp_idx" ON "blog_feedback" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "blog_feedback_emoji_idx" ON "blog_feedback" USING btree ("emoji");--> statement-breakpoint
CREATE INDEX "blog_feedback_fingerprint_idx" ON "blog_feedback" USING btree ("fingerprint");