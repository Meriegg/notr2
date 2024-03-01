import jwt from "jsonwebtoken";
import { env } from "~/env";

export const createExtensionJwt = ({ extId }: { extId: string }) => {
  const token = jwt.sign(
    {
      tokenType: "extension-authorization",
      extId,
    },
    env.SECRET_KEY,
    {
      expiresIn: "365d",
    },
  );

  return token;
};

export const verifyExtensionJwt = ({ token }: { token: string }) => {
  try {
    const decoded = jwt.verify(token, env.SECRET_KEY) as {
      tokenType: string;
      extId: string;
      exp: number;
    } | null;
    if (decoded?.tokenType !== "extension-authorization" || !decoded?.extId) {
      return null;
    }

    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded.extId;
  } catch (error) {
    console.error(error);
    return null;
  }
};
