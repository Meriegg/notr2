import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { useSearchParams } from "next/navigation";
import { db } from "~/server/db";
import { userSessions, users } from "~/server/db/schema";

export const getSession = async () => {
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth-token")?.value;
  if (!authToken) {
    return {
      error: true,
      message: "No auth token present",
    };
  }

  const [session] = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.sessionToken, authToken));
  if (!session || !session.expiresOn) {
    return {
      error: true,
      message: "This session does not exist anymore.",
    };
  }

  if (new Date().getTime() > session.expiresOn.getTime()) {
    await db.delete(userSessions).where(eq(userSessions.id, session.id));

    return {
      error: true,
      message: "Session expired.",
    };
  }

  const [data] = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.id, session.id))
    .leftJoin(users, eq(users.id, userSessions.userId));
  if (!data?.users) {
    return {
      error: true,
      message: "User does not exist.",
    };
  }

  return {
    session: data.user_sessions,
    userData: data.users,
  };
};
