CREATE TABLE IF NOT EXISTS "verified_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"userId" uuid,
	"verifiedOn" timestamp DEFAULT now(),
	CONSTRAINT "verified_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "verifiedEmails";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verified_emails" ADD CONSTRAINT "verified_emails_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
