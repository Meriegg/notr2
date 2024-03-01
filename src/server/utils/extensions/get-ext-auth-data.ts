import { db } from "~/server/db";
import { verifyExtensionJwt } from "./extension-jwt";
import { authorizedExtensions } from "~/server/db/schema";
import { sql } from "drizzle-orm";

export const getExtAuthData = async (token: string | null) => {
  if (!token) {
    return {
      error: true,
      errorStatus: 401,
      message: "No auth token.",
    };
  }

  const extId = verifyExtensionJwt({ token });
  if (!extId) {
    return {
      error: true,
      errorStatus: 401,
      message: "Invalid auth token.",
    };
  }

  const extension = await db.query.authorizedExtensions.findFirst({
    where: sql`${authorizedExtensions.id} = ${extId}`,
    with: {
      user: true,
    },
  });
  if (!extension) {
    return {
      error: true,
      errorStatus: 404,
      message: "This extension is not registered or has been deleted.",
    };
  }

  if (!extension.authorizedOn) {
    return {
      error: true,
      errorStatus: 401,
      message: "This extension has not been authorized yet.",
    };
  }

  if (extension.isRestricted) {
    return {
      error: true,
      errorStatus: 401,
      message: "This extension has been restricted.",
    };
  }

  return {
    error: false,
    extension,
    user: extension.user,
  };
};
