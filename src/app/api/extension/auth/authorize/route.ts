import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { authorizedExtensions } from "~/server/db/schema";
import { verifyExtensionJwt } from "~/server/utils/extensions/extension-jwt";

export const POST = async (request: Request) => {
  const jsonBody = (await request.json()) as { extensionToken: string };
  const body = z.object({ extensionToken: z.string() }).parse(jsonBody);

  const extensionId = verifyExtensionJwt({ token: body.extensionToken });
  if (!extensionId) {
    return new Response("Invalid extension token.", {
      status: 401,
    });
  }

  const [dbExtension] = await db
    .select()
    .from(authorizedExtensions)
    .where(sql`${authorizedExtensions.id} = ${extensionId}`);
  if (!dbExtension) {
    return new Response("This token has been invalidated.", {
      status: 401,
    });
  }

  if (!!dbExtension.authorizedOn) {
    return new Response("This token has already been used.", {
      status: 401,
    });
  }

  if (!!dbExtension.isRestricted) {
    return new Response("This token is restricted.", {
      status: 401,
    });
  }

  await db
    .update(authorizedExtensions)
    .set({
      authorizedOn: new Date(),
    })
    .where(sql`${authorizedExtensions.id} = ${extensionId}`);

  return Response.json({ success: true });
};
