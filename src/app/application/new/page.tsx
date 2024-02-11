import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { notes } from "~/server/db/schema";
import { getUserAuthData } from "~/server/utils/auth/get-user-auth-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Page = async ({
  searchParams: { folderId },
}: {
  searchParams: { folderId?: string | null };
}) => {
  const userData = await getUserAuthData();
  if (userData.error) {
    redirect("/login");
  }

  const [note] = await db
    .insert(notes)
    .values({
      userId: userData.userData!.id,
      title: "Untitled",
      content: "",
      folderId,
    })
    .returning();

  redirect(`/application/${note?.id}`);
};

export default Page;
