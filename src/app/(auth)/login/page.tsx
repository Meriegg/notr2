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
        Log into your account
      </h1>
      <p className="-mt-4 text-center text-sm text-neutral-900">
        By logging in you accept our{" "}
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
                `/login?error=${error?.message ?? "Something went wrong"}`,
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
        <Label htmlFor="email_input">Email</Label>
        <Input
          id="email_input"
          name="email"
          type="email"
          placeholder="john@example.com"
          required={true}
        />

        <Button type="submit" variant="secondary" className="w-full">
          Log in!
        </Button>
      </form>

      <div className="-mt-4 flex w-full items-center justify-start">
        <Link
          href="/signUp"
          className="w-fit text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Sign up?
        </Link>
      </div>
    </div>
  );
};

export default Page;
