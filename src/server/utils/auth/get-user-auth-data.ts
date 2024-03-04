import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { userSessions, users } from "~/server/db/schema";
import verifySignedString from "../crypto/verify-signed-string";
import {
  createRefreshToken,
  verifyRefreshToken,
} from "./verification-tokens/refresh-token";
import { createUserSession } from "./create-user-session";
import { env } from "~/env";
import { redirect } from "next/navigation";

const getUserAuthData_Main = async () => {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get("auth-token")?.value;
    if (!authToken) {
      return {
        error: true,
        message: "No auth token present",
        refreshable: false,
      };
    }

    if (authToken.split(":")?.length !== 2) {
      return {
        error: true,
        message: "Invalid token format",
        refreshable: false,
      };
    }

    const sessionToken = authToken.split(":")[0];
    const signature = authToken.split(":")[1];
    if (!sessionToken || !signature) {
      return {
        error: true,
        message: "Invalid token format",
        refreshable: false,
      };
    }

    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
    if (!session?.expiresOn) {
      return {
        error: true,
        message: "This session does not exist anymore.",
        sessionToken,
        refreshable: true,
      };
    }

    if (new Date().getTime() > session.expiresOn.getTime()) {
      return {
        error: true,
        message: "Session expired.",
        sessionToken,
        refreshable: true,
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
        refreshable: false,
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
        refreshable: false,
      };
    }
    if (!data?.user_sessions || !data?.users) {
      return {
        error: true,
        message: "Invalid data.",
        refreshable: false,
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
      message:
        (error as { message?: string | null })?.message ??
        "You are not logged in.",
      refreshable: false,
    };
  }
};

// The `Main` function is the one handling the actual logic of verifying
// users. This one is just a wrapper around it to implement refresh tokens
// in a cleaner way.
export const getUserAuthData = async () => {
  const userData = await getUserAuthData_Main();
  if (userData.error) {
    if (!userData?.refreshable || !userData?.sessionToken) {
      return {
        error: true,
        message: userData?.message ?? "You are not logged in.",
      };
    }
    redirect(`/refresh-session?sessionToken=${userData.sessionToken}`);
  }

  return {
    session: userData.session!,
    userData: userData.userData!,
    error: false,
    message: null,
  };
};
