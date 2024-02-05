import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { userSessions, users } from "~/server/db/schema";
import verifySignedString from "../crypto/verify-signed-string";

export const getSession = async () => {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get("auth-token")?.value;
    if (!authToken) {
      return {
        error: true,
        message: "No auth token present",
      };
    }

    if (authToken.split(":")?.length !== 2) {
      return {
        error: true,
        message: "Invalid token format",
      };
    }

    const sessionToken = authToken.split(":")[0];
    const signature = authToken.split(":")[1];
    if (!sessionToken || !signature) {
      return {
        error: true,
        message: "Invalid token format",
      };
    }

    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
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

    const isSignatureValid = verifySignedString(
      sessionToken,
      signature,
      session.publicVerificationKey,
    );
    if (!isSignatureValid) {
      return {
        error: true,
        message: "Signature verification failed.",
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
  } catch (error) {
    console.error(error);

    return {
      error: true,
      message: error?.message ?? "You are not logged in.",
    };
  }
};
