import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { db } from "~/server/db";
import { userSessions, users } from "~/server/db/schema";
import { createUserSession } from "~/server/utils/auth/create-user-session";
import {
  createRefreshToken,
  verifyRefreshToken,
} from "~/server/utils/auth/verification-tokens/refresh-token";

const Page = ({
  searchParams: { sessionToken, redirectTo },
}: {
  searchParams: { sessionToken?: string | null; redirectTo?: string | null };
}) => {
  if (!sessionToken) redirect("/login");

  return (
    <div
      className="mx-auto flex h-[100vh] flex-col items-center justify-center gap-6"
      style={{ width: "min(350px, 100%)" }}
    >
      <h1 className="text-xl font-semibold tracking-normal text-neutral-700">
        Stay logged in?
      </h1>
      <p className="-mt-4 text-center text-sm text-neutral-900">
        Your session has expired, refresh your session to stay logged in?
      </p>

      <div className="flex items-center gap-2">
        <form
          id="STAY_LOGGED_IN_FORM"
          action={async () => {
            "use server";

            const cookieStore = cookies();
            const refreshToken = cookieStore.get("refresh-token")?.value;
            if (!refreshToken) redirect("/login");

            const [invalidSession] = await db
              .select()
              .from(userSessions)
              .where(eq(userSessions.sessionToken, sessionToken));
            if (!invalidSession) redirect("/login");

            const verifiedRefreshTokenData = verifyRefreshToken({
              token: refreshToken,
            });

            if (!verifiedRefreshTokenData) redirect("/login");
            if (invalidSession.id !== verifiedRefreshTokenData.sessionId)
              redirect("/login");

            const newSession = await createUserSession({
              userId: invalidSession.userId,
            });

            const newRefreshToken = newSession?.sessionId
              ? createRefreshToken({
                  userId: invalidSession.userId,
                  sessionId: newSession.sessionId,
                })
              : null;

            const [dbUserData] = await db
              .select()
              .from(users)
              .where(eq(users.id, invalidSession.userId));
            if (!dbUserData) redirect("/login");

            cookieStore.set("auth-token", newSession.authToken, {
              httpOnly: true,
              secure: env.NODE_ENV === "production" ? true : false,
              maxAge: 60 * 60 * 6,
              path: "/",
              sameSite: true,
            });

            if (newRefreshToken) {
              cookieStore.set("refresh-token", newRefreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === "production" ? true : false,
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
                sameSite: true,
              });
            }

            redirect(redirectTo ?? "/application");
          }}
        >
          <Button type="submit" variant="default" className="w-full">
            Stay logged in
          </Button>
        </form>
        <form
          id="LOG_OUT_FORM"
          action={async () => {
            "use server";
            const cookieStore = cookies();
            cookieStore.delete("auth-token");
            cookieStore.delete("refresh-token");

            redirect("/login");
          }}
        >
          <Button type="submit" variant="ghost" className="w-full">
            Log out
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Page;
