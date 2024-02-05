import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "~/env";
import { createEmailVerificationToken } from "~/server/utils/auth/verification-tokens/email-verification";
import { api } from "~/trpc/server";

const Page = () => {
  return (
    <div>
      <p>Log in</p>
      <form
        action={async (data) => {
          "use server";
          const cookieStore = cookies();

          const formData = {
            email: data.get("email"),
          };

          const submitData = z
            .object({
              email: z.string().email(),
            })
            .parse(formData);

          const apiData = await api.auth.login
            .mutate({ ...submitData })
            .catch((error) => {
              console.error(error);
              redirect(
                `/login/error?message=${error?.message ?? "Something went wrong"}`,
              );
            });

          const emailVerificationToken = createEmailVerificationToken({
            userId: apiData.userId,
          });
          cookieStore.set("email-verification-token", emailVerificationToken, {
            maxAge: 60 * 60 * 12,
            path: "/",
            secure: env.NODE_ENV === "production" ? true : false,
            httpOnly: true,
            sameSite: true,
          });

          redirect(`/verify?userId=${apiData.userId}`);
        }}
      >
        <input
          name="email"
          type="email"
          placeholder="john@example.com"
          required={true}
        />
        <input type="submit" />
      </form>
      <Link href="/signUp">Sign up</Link>
    </div>
  );
};

export default Page;
