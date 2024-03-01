import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { notes } from "~/server/db/schema";
import { getExtAuthData } from "~/server/utils/extensions/get-ext-auth-data";

export const GET = async (request: Request) => {
  return new Response("Test error", {
    status: 401,
  });

  const authData = await getExtAuthData(request.headers.get("Authorization"));
  if (authData.error) {
    return new Response(authData?.message ?? "Invalid auth params.", {
      status: authData?.errorStatus ?? 401,
    });
  }

  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, authData.user!.id));

  return Response.json({
    notes: userNotes,
  });
};
