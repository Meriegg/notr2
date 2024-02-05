import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "~/env";
import { verifyEmailVerificationToken } from "~/server/utils/auth/verification-tokens/email-verification";
import { api } from "~/trpc/server";

const Page = ({
  searchParams: { userId },
}: {
  searchParams: { userId?: string | null };
}) => {
  if (!userId) {
    return <p>No user id to verify!</p>;
  }

  const cookieStore = cookies();
  const emailVerfificationToken = cookieStore.get(
    "email-verification-token",
  )?.value;
  if (!emailVerfificationToken) {
    throw new Error("No verification token found.");
  }

  const tokenUserId = verifyEmailVerificationToken({
    token: emailVerfificationToken,
  });
  if (tokenUserId !== userId) {
    throw new Error("Verification token is invalid.");
  }

  return (
    <div>
      <p>Verifying {userId}</p>

      <form
        action={async (data) => {
          "use server";
          const code = z.string().min(6).max(6).parse(data.get("code"));

          const res = await api.auth.verifyCode
            .mutate({
              code,
              userId,
            })
            .catch((error) => {
              console.error(error);
              redirect(
                `/verify/error?message=${error?.message ?? "Something went wrong"}`,
              );
            });

          const cookieStore = cookies();

          cookieStore.set("auth-token", res.authToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production" ? true : false,
            maxAge: 60 * 60 * 6,
            path: "/",
            sameSite: true,
          });

          redirect("/");
        }}
      >
        <input name="code" placeholder="123456" maxLength={6} required={true} />
        <input type="submit" />
      </form>
    </div>
  );
};

export default Page;
