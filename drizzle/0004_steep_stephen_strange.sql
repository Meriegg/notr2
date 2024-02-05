ALTER TABLE "auth_verification_codes" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_verification_codes" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_verification_codes" ALTER COLUMN "expiresOn" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "sessionToken" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "expiresOn" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "publicVerificationKey" varchar NOT NULL;