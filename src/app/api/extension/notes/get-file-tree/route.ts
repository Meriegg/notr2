import { getExtAuthData } from "~/server/utils/extensions/get-ext-auth-data";
import { getUserFileTree } from "~/server/utils/other/get-user-file-tree";

export const GET = async (request: Request) => {
  const authData = await getExtAuthData(request.headers.get("Authorization"));
  if (authData.error) {
    return new Response(authData?.message ?? "Invalid auth params.", {
      status: authData?.errorStatus ?? 401,
    });
  }

  const { fileTree, userFolders, userNotes } = await getUserFileTree({
    userId: authData.user!.id,
  });

  return Response.json({
    fileTree,
    userFolders,
    userNotes,
  });
};
