import { v4 as uuid } from "uuid";
import generateKeyPair from "~/server/utils/crypto/generate-key-pair";
import createSignedString from "../crypto/create-signed-string";
import { userSessions } from "~/server/db/schema";
import { db } from "~/server/db";

export const createUserSession = async ({ userId }: { userId: string }) => {
  const sessionToken = uuid();

  const keypair = generateKeyPair();
  const signedSessionToken = createSignedString(sessionToken, keypair);

  const authToken = `${sessionToken}:${signedSessionToken.signature}`;

  // 6 hours into the future
  const sessionExpirationDate = new Date(Date.now() + 6 * 3600000);
  const [sessionData] = await db
    .insert(userSessions)
    .values({
      sessionToken,
      userId,
      expiresOn: sessionExpirationDate,
      publicVerificationKey: signedSessionToken.publicKey,
    })
    .returning({ sessionId: userSessions.id });

  return { authToken, sessionId: sessionData?.sessionId };
};
