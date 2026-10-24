CREATE TABLE "reply_snippets" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reply_snippets_signature_idx" ON "reply_snippets" USING btree ("kind") WHERE "reply_snippets"."kind" = 'signature';