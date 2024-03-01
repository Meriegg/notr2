import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { extensionsRouter } from "./routers/extensions";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  extensions: extensionsRouter,
});

export type AppRouter = typeof appRouter;
