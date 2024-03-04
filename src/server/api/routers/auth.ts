import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  authVerificationCodes,
  users,
  verifiedEmails,
} from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendVerificationCode } from "~/server/utils/auth/send-verification-code";
import { createUserSession } from "~/server/utils/auth/create-user-session";
import { createRefreshToken } from "~/server/utils/auth/verification-tokens/refresh-token";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input: { username, email }, ctx: { db } }) => {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This email is already in use.",
        });
      }

      const [newUser] = await db
        .insert(users)
        .values({
          email,
          username,
        })
        .returning({ userId: users.id });
      if (!newUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to sign up.",
        });
      }

      await sendVerificationCode({
        userId: newUser.userId,
        verifiedEmail: email,
      });

      return newUser;
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx: { db }, input: { email } }) => {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This user does not exist.",
        });
      }

      await sendVerificationCode({
        userId: existingUser.id,
        verifiedEmail: email,
      });

      return { userId: existingUser.id };
    }),
  verifyCode: publicProcedure
    .input(z.object({ code: z.string().min(6).max(6), userId: z.string() }))
    .mutation(async ({ ctx: { db }, input: { code, userId } }) => {
      const [existingCode] = await db
        .select()
        .from(authVerificationCodes)
        .where(
          sql`${authVerificationCodes.code} = ${code} AND ${authVerificationCodes.userId} = ${userId}`,
        );
      if (!existingCode?.expiresOn) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid code",
        });
      }

      if (existingCode.alreadyUsed) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Code is already used.",
        });
      }

      if (new Date().getTime() > existingCode.expiresOn.getTime()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Code expired.",
        });
      }

      await db
        .update(authVerificationCodes)
        .set({
          alreadyUsed: true,
        })
        .where(eq(authVerificationCodes.id, existingCode.id));

      const { authToken, sessionId } = await createUserSession({
        userId: existingCode.userId,
      });

      const refreshToken = sessionId
        ? createRefreshToken({ userId: existingCode.userId, sessionId })
        : null;

      if (existingCode.verifiedEmail) {
        const [existingVerifiedEmail] = await db
          .select()
          .from(verifiedEmails)
          .where(eq(verifiedEmails.email, existingCode.verifiedEmail));

        if (!existingVerifiedEmail) {
          await db.insert(verifiedEmails).values({
            email: existingCode.verifiedEmail,
            userId: existingCode.userId,
          });
        }
      }

      return { authToken, refreshToken };
    }),
});
