import { db } from "~/server/db";
import { generateAuthCode } from "./generate-code";
import { authVerificationCodes } from "~/server/db/schema";

export const sendVerificationCode = async ({ userId }: { userId: string }) => {
  const authCode = generateAuthCode();

  // 15 minutes into the future
  const codeExpirationDate = new Date(Date.now() + 15 * 60000);
  await db.insert(authVerificationCodes).values({
    code: authCode.codeStr,
    userId: userId,
    expiresOn: codeExpirationDate,
  });

  return { authCode };
};
