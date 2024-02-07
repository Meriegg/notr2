import { eq } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { folders, notes } from "~/server/db/schema";

export type FileTreeItem =
  | {
      type: "note";
      entryName: string;
      noteId: string;
    }
  | {
      type: "folder";
      entryName: string;
      folderId: string;
      content: FileTreeItem[];
    };

export const userRouter = createTRPCRouter({
  userData: privateProcedure.query(({ ctx: { userAuthData } }) => userAuthData),
  getUserFileTree: privateProcedure.query(
    async ({ ctx: { db, userAuthData } }) => {
      const userNotes = await db
        .select()
        .from(notes)
        .where(eq(notes.userId, userAuthData.userData!.id));

      const userFolders = await db
        .select()
        .from(folders)
        .where(eq(folders.userId, userAuthData.userData!.id));

      let fileTree: FileTreeItem[] = [];

      // Helper function to recursively build the file tree
      const buildFileTree = (parentId: string | null): FileTreeItem[] => {
        const foldersInParent = userFolders
          .filter((folder) => folder.parentFolderId === parentId)
          .map((folder) => ({
            type: "folder",
            entryName: folder.name,
            folderId: folder.id,
            content: buildFileTree(folder.id),
          }));

        const notesInParent = userNotes
          .filter((note) => note.folderId === parentId)
          .map((note) => ({
            type: "note",
            entryName: note.title,
            noteId: note.id,
          }));

        return [...foldersInParent, ...notesInParent];
      };

      fileTree = buildFileTree(null);

      return { userNotes, userFolders, fileTree };
    },
  ),
});
