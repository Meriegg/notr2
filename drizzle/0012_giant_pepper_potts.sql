ALTER TABLE "notes" DROP CONSTRAINT "notes_folderId_folders_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_folderId_folders_id_fk" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
