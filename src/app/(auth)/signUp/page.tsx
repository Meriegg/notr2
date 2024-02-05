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
      <p>Sign up</p>

      <form
        action={async (data) => {
          "use server";
          const cookieStore = cookies();

          const formData = {
            username: data.get("username"),
            email: data.get("email"),
          };

          const submitData = z
            .object({
              username: z.string().min(1),
              email: z.string().email(),
            })
            .parse(formData);

          const apiData = await api.auth.signUp
            .mutate({ ...submitData })
            .catch((error) => {
              console.error(error);
              redirect(
                `/signUp/error?message=${error?.message ?? "Something went wrong"}`,
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
        <input name="username" placeholder="John doe" required={true} />
        <input
          name="email"
          type="email"
          placeholder="john@example.com"
          required={true}
        />
        <input type="submit" />
      </form>
      <Link href="/login">Login</Link>
    </div>
  );
};

export default Page;
