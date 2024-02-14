import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { folders, notes } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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

        return [...foldersInParent, ...notesInParent] as FileTreeItem[];
      };

      fileTree = buildFileTree(null);

      return { userNotes, userFolders, fileTree };
    },
  ),
  getNote: privateProcedure
    .input(
      z.object({
        noteId: z.string(),
      }),
    )
    .query(async ({ ctx: { db, userAuthData }, input: { noteId } }) => {
      const [note] = await db
        .select()
        .from(notes)
        .where(
          sql`${notes.id} = ${noteId} AND ${notes.userId} = ${userAuthData.userData!.id}`,
        );
      if (!note) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This note does not exist.",
        });
      }

      return note;
    }),
  createNote: privateProcedure
    .input(
      z
        .object({
          folderId: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ ctx: { db, userAuthData }, input }) => {
      const [noteData] = await db
        .insert(notes)
        .values({
          title: "Untitled",
          userId: userAuthData.userData!.id,
          tags: [],
          content: "",
          folderId: input?.folderId,
        })
        .returning({ noteId: notes.id });
      if (!noteData?.noteId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create note.",
        });
      }

      return { noteId: noteData?.noteId };
    }),
  createFolder: privateProcedure
    .input(
      z.object({
        parentFolderId: z.string().optional(),
        folderName: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx: { db, userAuthData },
        input: { parentFolderId, folderName },
      }) => {
        const [folderData] = await db
          .insert(folders)
          .values({
            userId: userAuthData.userData!.id,
            name: folderName,
            parentFolderId,
          })
          .returning({ folderId: folders.id });
        if (!folderData?.folderId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unable to create folder.",
          });
        }

        return {
          folderId: folderData.folderId,
        };
      },
    ),
  updateNote: privateProcedure
    .input(
      z.object({
        noteId: z.string(),
        content: z.string(),
        title: z.string(),
        tags: z.string().array(),
        _parsedtextcontent: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx: { db, userAuthData },
        input: { content, title, tags, noteId, _parsedtextcontent },
      }) => {
        const [noteData] = await db
          .update(notes)
          .set({
            content: content,
            title: !!title ? title : "Untitled",
            tags: tags ?? [],
            _parsedtextcontent,
          })
          .where(
            sql`${notes.id} = ${noteId} AND ${notes.userId} = ${userAuthData.userData!.id}`,
          )
          .returning({ noteId: notes.id });
        if (!noteData?.noteId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "This note either does not exist or does not belong to you.",
          });
        }

        return { noteData, editDate: new Date() };
      },
    ),
  deleteNote: privateProcedure
    .input(
      z.object({
        noteId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { db, userAuthData }, input: { noteId } }) => {
      await db
        .delete(notes)
        .where(
          sql`${notes.id} = ${noteId} AND ${notes.userId} = ${userAuthData.userData!.id}`,
        );

      return { success: true };
    }),
  deleteFolder: privateProcedure
    .input(
      z.object({
        folderId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { db, userAuthData }, input: { folderId } }) => {
      await db
        .delete(folders)
        .where(
          sql`${folders.id} = ${folderId} AND ${folders.userId} = ${userAuthData.userData!.id}`,
        );

      return { success: true };
    }),
  renameFolder: privateProcedure
    .input(
      z.object({
        folderId: z.string(),
        newName: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { db, userAuthData }, input: { folderId, newName } }) => {
        const [folderData] = await db
          .update(folders)
          .set({
            name: newName,
          })
          .where(
            sql`${folders.id} = ${folderId} AND ${folders.userId} = ${userAuthData.userData!.id}`,
          )
          .returning({ folderId: folders.id });
        if (!folderData?.folderId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This note does not exist.",
          });
        }

        return { folderData };
      },
    ),
});
