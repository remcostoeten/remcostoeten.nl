CREATE TABLE "contact_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"from_email" text NOT NULL,
	"to_email" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"gmail_message_id" text,
	"gmail_thread_id" text,
	"rfc_message_id" text,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp,
	"failed_at" timestamp,
	"last_error" text,
	CONSTRAINT "contact_replies_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "read_at" timestamp;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "starred_at" timestamp;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "replied_at" timestamp;--> statement-breakpoint
ALTER TABLE "contact_replies" ADD CONSTRAINT "contact_replies_submission_id_contact_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_replies_submission_idx" ON "contact_replies" USING btree ("submission_id","created_at");--> statement-breakpoint
CREATE INDEX "contact_replies_status_idx" ON "contact_replies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_replies_created_idx" ON "contact_replies" USING btree ("created_at");