import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { folders, notes } from "~/server/db/schema";
import { FileTreeItem } from "~/server/api/routers/user";

export const getUserFileTree = async ({ userId }: { userId: string }) => {
  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId));

  const userFolders = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId));

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

    return [...foldersInParent, ...notesInParent] as FileTreeItem[];
  };

  fileTree = buildFileTree(null);

  return { fileTree, userNotes, userFolders };
};
