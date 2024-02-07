import { redirect } from "next/navigation";
import { Editor } from "~/components/application/editor";
import { db } from "~/server/db";
import { notes } from "~/server/db/schema";
import { getSession } from "~/server/utils/auth/get-session";

const Page = async ({
  searchParams: { folderId },
}: {
  searchParams: { folderId?: string | null };
}) => {
  const userData = await getSession();
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

  return <Editor note={note!} />;
};

export default Page;
