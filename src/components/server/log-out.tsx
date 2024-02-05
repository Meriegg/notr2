import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "~/server/db";
import { userSessions } from "~/server/db/schema";

interface Props {
  sessionId: string;
}

export const Server_LogOut = ({ sessionId }: Props) => {
  return (
    <form
      action={async (data) => {
        "use server";

        const sessionId = z.string().min(1).parse(data.get("session-id"));

        await db.delete(userSessions).where(eq(userSessions.id, sessionId));

        const cookieStore = cookies();
        cookieStore.delete("auth-token");

        redirect("/login");
      }}
    >
      <input type="hidden" name="session-id" value={sessionId} />

      <button type="submit" className="text-red-500 hover:text-red-600">
        Log out
      </button>
    </form>
  );
};
