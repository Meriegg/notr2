import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { env } from "~/env";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { XIcon } from "lucide-react";
import { verifyEmailVerificationToken } from "~/server/utils/auth/verification-tokens/email-verification";
import { api } from "~/trpc/server";

const Page = async ({
  searchParams: { userId, error, redirectTo },
}: {
  searchParams: {
    userId?: string | null;
    error?: string | null;
    redirectTo?: string | null;
  };
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

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    return notFound();
  }

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
        Verify authentication code
      </h1>
      <p className="-mt-4 text-center text-sm text-neutral-900">
        An email was sent to <span className="font-semibold">{user.email}</span>
      </p>

      <form
        className="flex w-full flex-col gap-2"
        action={async (data) => {
          "use server";
          const codeValidation = z.string().min(6).max(6);

          const { success } = codeValidation.safeParse(data.get("code"));
          if (!success) {
            redirect(`/verify?userId=${userId}&error=${"Invalid input."}`);
          }

          const code = data.get("code") as z.infer<typeof codeValidation>;

          const res = await api.auth.verifyCode
            .mutate({
              code,
              userId,
            })
            .catch((error: { message?: string | null }) => {
              console.error(error);
              redirect(
                `/verify?userId=${userId}&error=${error?.message ?? "Unable to verify code."}`,
              );
            });

          const cookieStore = cookies();

          cookieStore.set("auth-token", res.authToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "production" ? true : false,
            // The maxAge of the auth token is the same as the refresh token (7 days)
            // because without the auth token, refreshing sessions is impossible
            // (the session token inside the auth token is mandatory).
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: true,
          });

          if (res.refreshToken) {
            cookieStore.set("refresh-token", res.refreshToken, {
              httpOnly: true,
              secure: env.NODE_ENV === "production" ? true : false,
              maxAge: 60 * 60 * 24 * 7,
              path: "/",
              sameSite: true,
            });
          }

          redirect(redirectTo ?? "/");
        }}
      >
        <Label htmlFor="code_input">6 digit code</Label>
        <Input
          id="code_input"
          name="code"
          placeholder="123456"
          maxLength={6}
          required={true}
        />

        <Button type="submit" variant="secondary" className="w-full">
          Verify code
        </Button>
      </form>
    </div>
  );
};

export default Page;
