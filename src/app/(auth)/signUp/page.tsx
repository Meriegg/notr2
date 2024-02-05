import { XIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { env } from "~/env";
import { createEmailVerificationToken } from "~/server/utils/auth/verification-tokens/email-verification";
import { api } from "~/trpc/server";

const Page = ({
  searchParams: { error },
}: {
  searchParams: { error?: string | null };
}) => {
  return (
    <div
      className="mx-auto flex h-[100vh] flex-col items-center justify-center gap-6"
      style={{ width: "min(350px, 100%)" }}
    >
      {error && (
        <Alert variant="destructive">
          <XIcon className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <h1 className="text-xl font-semibold tracking-normal text-neutral-700">
        Sign up for Notr!
      </h1>
      <p className="-mt-4 text-center text-sm text-neutral-900">
        By signing up you accept our{" "}
        <Link
          href="#"
          className="text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Privacy policy
        </Link>
      </p>

      <form
        className="flex w-full flex-col gap-2"
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
                `/signUp?error=${error?.message ?? "Something went wrong"}`,
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
        <Label htmlFor="username_input">Username</Label>
        <Input
          id="username_input"
          name="username"
          placeholder="John doe"
          required={true}
        />

        <Label htmlFor="email_input">Email</Label>
        <Input
          id="email_input"
          name="email"
          type="email"
          placeholder="john@example.com"
          required={true}
        />

        <Button type="submit" variant="secondary" className="w-full">
          Sign up
        </Button>
      </form>

      <div className="-mt-4 flex w-full items-center justify-start">
        <Link
          href="/login"
          className="w-fit text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Log in?
        </Link>
      </div>
    </div>
  );
};

export default Page;
