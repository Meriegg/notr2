import jwt from "jsonwebtoken";
import { env } from "~/env";

export const createRefreshToken = ({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}) => {
  const token = jwt.sign(
    {
      tokenType: "refresh-token",
      userId,
      sessionId,
    },
    env.SECRET_KEY,
    {
      expiresIn: "7d",
    },
  );

  return token;
};

export const verifyRefreshToken = ({ token }: { token: string }) => {
  try {
    const decoded = jwt.verify(token, env.SECRET_KEY) as {
      tokenType: string;
      userId: string;
      sessionId: string;
      exp: number;
    } | null;
    if (
      decoded?.tokenType !== "refresh-token" ||
      !decoded?.userId ||
      !decoded?.sessionId
    ) {
      return null;
    }

    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
