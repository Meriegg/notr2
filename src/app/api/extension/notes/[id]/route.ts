import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { notes } from "~/server/db/schema";
import { getExtAuthData } from "~/server/utils/extensions/get-ext-auth-data";

export const GET = async (
  request: Request,
  { params }: { params: { id: string | null } },
) => {
  if (!params?.id) {
    return new Response("Invalid note id.", {
      status: 404,
    });
  }

  const authData = await getExtAuthData(request.headers.get("Authorization"));
  if (authData.error) {
    return new Response(authData?.message ?? "Invalid auth params.", {
      status: authData?.errorStatus ?? 401,
    });
  }

  const [note] = await db
    .select()
    .from(notes)
    .where(
      sql`${notes.id} = ${params.id} and ${notes.userId} = ${authData.user!.id}`,
    );
  if (!note) {
    return new Response("This note does not exist.", {
      status: 404,
    });
  }

  return Response.json({
    note,
  });
};
