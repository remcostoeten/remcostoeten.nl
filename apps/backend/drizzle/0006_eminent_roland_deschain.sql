CREATE TABLE "contact_messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contact_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"contact" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"read" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_messages_read_idx" ON "contact_messages" USING btree ("read");