import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cn } from "~/lib/utils";
import { db } from "~/server/db";
import { userSessions } from "~/server/db/schema";

interface Props {
  sessionId: string;
  className?: string;
  preventDefaultStyles?: boolean;
}

export const Server_LogOut = ({
  sessionId,
  preventDefaultStyles = false,
  className = "",
}: Props) => {
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

      <button
        type="submit"
        className={cn(
          !preventDefaultStyles && "text-red-500 hover:text-red-600",
          className,
        )}
      >
        Log out
      </button>
    </form>
  );
};
