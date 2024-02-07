import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { db } from "~/server/db";
import { ZodError } from "zod";
import { getSession } from "../utils/auth/get-session";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    ...opts,
    db,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const authMiddleware = t.middleware(async ({ next, ctx }) => {
  const userAuthData = await getSession();
  if (userAuthData.error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: userAuthData?.message ?? "You are not logged in.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userAuthData,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(authMiddleware);
