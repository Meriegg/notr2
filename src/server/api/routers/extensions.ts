import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { authorizedExtensions } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { createExtensionJwt } from "~/server/utils/extensions/extension-jwt";
import { sql } from "drizzle-orm";

export const extensionsRouter = createTRPCRouter({
  linkNewExtension: privateProcedure
    .input(
      z.object({
        extensionName: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { db, userAuthData }, input: { extensionName } }) => {
        const [extensionData] = await db
          .insert(authorizedExtensions)
          .values({
            extensionName,
            userId: userAuthData.userData!.id,
          })
          .returning({ extId: authorizedExtensions.id });
        if (!extensionData?.extId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unable to link a new extension.",
          });
        }

        const authorizationToken = createExtensionJwt({
          extId: extensionData.extId,
        });

        return {
          extensionData,
          authorizationToken,
        };
      },
    ),
  deleteAuthorization: privateProcedure
    .input(z.object({ extId: z.string() }))
    .mutation(async ({ ctx: { db, userAuthData }, input: { extId } }) => {
      const [extData] = await db
        .delete(authorizedExtensions)
        .where(
          sql`${authorizedExtensions.id} = ${extId} and ${authorizedExtensions.userId} = ${userAuthData.userData!.id}`,
        )
        .returning({ id: authorizedExtensions.id });
      if (!extData?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This extension either does not exist or does not belong to you.",
        });
      }

      return { success: true, extData };
    }),
  setExtensionSuspended: privateProcedure
    .input(z.object({ extId: z.string(), isSuspended: z.boolean() }))
    .mutation(
      async ({ ctx: { db, userAuthData }, input: { extId, isSuspended } }) => {
        const [extData] = await db
          .update(authorizedExtensions)
          .set({
            isRestricted: isSuspended,
          })
          .where(
            sql`${authorizedExtensions.id} = ${extId} and ${authorizedExtensions.userId} = ${userAuthData.userData!.id}`,
          )
          .returning({ id: authorizedExtensions.id });
        if (!extData?.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "This extension either does not exist or does not belong to you.",
          });
        }

        return { success: true, extData };
      },
    ),
});
