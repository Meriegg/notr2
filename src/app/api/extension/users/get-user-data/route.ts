import { getExtAuthData } from "~/server/utils/extensions/get-ext-auth-data";

export const GET = async (request: Request) => {
  const authData = await getExtAuthData(request.headers.get("Authorization"));
  if (authData.error) {
    return new Response(authData?.message ?? "Invalid auth params.", {
      status: authData?.errorStatus ?? 401,
    });
  }

  return Response.json({
    extension: authData.extension,
    user: authData.user,
  });
};
