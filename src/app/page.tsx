import { redirect } from "next/navigation";
import { getUserAuthData } from "~/server/utils/auth/get-user-auth-data";

export default async function Home() {
  const userData = await getUserAuthData();
  if (userData?.error) {
    redirect("/login");
  }

  redirect("/application/new");
}
