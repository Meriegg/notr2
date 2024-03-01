CREATE TABLE IF NOT EXISTS "authorized_extensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extensionName" varchar(30) NOT NULL,
	"userId" uuid NOT NULL,
	"issuedOn" timestamp DEFAULT now() NOT NULL,
	"authorizedOn" timestamp,
	"isRestricted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authorized_extensions" ADD CONSTRAINT "authorized_extensions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
