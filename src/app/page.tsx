import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Server_LogOut } from "~/components/server/log-out";
import { db } from "~/server/db";
import { userSessions } from "~/server/db/schema";
import { getSession } from "~/server/utils/auth/get-session";

export default async function Home() {
  const userData = await getSession();
  if (userData.error) {
    redirect("/login");
  }

  return (
    <div>
      <p>Hello {userData.userData?.username}!</p>

      <Server_LogOut sessionId={userData.session?.id ?? ""} />
    </div>
  );
}
