import jwt from "jsonwebtoken";
import { env } from "~/env";

export const createEmailVerificationToken = ({
  userId,
}: {
  userId: string;
}) => {
  const token = jwt.sign(
    {
      tokenType: "email-verification",
      userId,
    },
    env.SECRET_KEY,
    {
      expiresIn: "12h",
    },
  );

  return token;
};

export const verifyEmailVerificationToken = ({ token }: { token: string }) => {
  try {
    const decoded = jwt.verify(token, env.SECRET_KEY) as {
      tokenType: string;
      userId: string;
      exp: number;
    } | null;
    if (decoded?.tokenType !== "email-verification" || !decoded?.userId) {
      return null;
    }

    if (Date.now() >= decoded.exp * 1000) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error(error);
    return null;
  }
};
