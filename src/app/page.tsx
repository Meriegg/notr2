import { redirect } from "next/navigation";
import { getSession } from "~/server/utils/auth/get-session";

export default async function Home() {
  const userData = await getSession();
  if (userData.error) {
    redirect("/login");
  }

  redirect("/application/new");
}
