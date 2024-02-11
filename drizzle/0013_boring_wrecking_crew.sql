-- Custom SQL migration file, put you code below! --
ALTER TABLE "folders" ADD CONSTRAINT ADD FOREIGN KEY ("folderId") REFERENCES folders(id) ON DELETE CASCADE; 

