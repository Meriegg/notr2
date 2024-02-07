import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { notes } from "~/server/db/schema";
import { getSession } from "~/server/utils/auth/get-session";

const Page = async () => {
  const userData = await getSession();
  if (userData.error || !userData.userData) {
    redirect("/login");
  }

  const [latestNote] = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userData.userData.id))
    .orderBy(desc(notes.createdOn))
    .limit(1);

  if (!latestNote) {
    redirect("/application/new");
  }

  redirect(`/application/${latestNote.id}`);
};

export default Page;
