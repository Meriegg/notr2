import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect, useServerInsertedHTML } from "next/navigation";
import { Server_LogOut } from "~/components/server/log-out";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { loginAction } from "~/server/actions/login";
import { db } from "~/server/db";
import { verifiedEmails } from "~/server/db/schema";
import { getUserAuthData } from "~/server/utils/auth/get-user-auth-data";

const Page = async () => {
  const userAuthData = await getUserAuthData();
  if (userAuthData.error) {
    redirect("/login");
  }

  const userVerifiedEmails = await db
    .select()
    .from(verifiedEmails)
    .where(eq(verifiedEmails.userId, userAuthData.userData!.id));

  const isUserEmailVerified =
    userVerifiedEmails.findIndex(
      (verifiedEmail) => verifiedEmail.email === userAuthData.userData!.email,
    ) !== -1;

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Account</h1>
      <p className="text-sm text-neutral-700">Personal information</p>

      <div className="mt-4 flex flex-col gap-1">
        <p className="text-base font-semibold text-neutral-900">Your data</p>

        <div className="text-sm">
          <p className="flex items-center gap-1">
            Your username{" "}
            <span className="rounded-md bg-neutral-50 px-2 py-1">
              {userAuthData.userData!.username}
            </span>
            <span className="rounded-md bg-neutral-50 px-2 py-1 text-neutral-900 underline">
              <Link href="/application/account/changeUsername">
                Change username
              </Link>
            </span>
          </p>
        </div>

        <div className="text-sm">
          <div className="flex items-center gap-1">
            <p className="flex items-center gap-1">
              Your email{" "}
              <span className="rounded-md bg-neutral-50 px-2 py-1">
                {userAuthData.userData!.email}{" "}
              </span>{" "}
              <span
                className={cn("rounded-md px-2 py-1", {
                  "bg-green-50 text-green-900": isUserEmailVerified,
                  "bg-red-50 text-red-900": !isUserEmailVerified,
                })}
              >
                {isUserEmailVerified ? "Verified" : "Not verified"}
              </span>
            </p>

            {!isUserEmailVerified && (
              <form action={loginAction}>
                <input
                  type="hidden"
                  name="email"
                  value={userAuthData.userData!.email}
                />

                <input
                  type="hidden"
                  name="finalRedirect"
                  value="/application/account"
                />

                <button
                  className="rounded-md bg-neutral-50 px-2 py-1 text-sm text-neutral-900 hover:bg-neutral-100"
                  type="submit"
                >
                  Verify email
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <p className="text-base font-semibold text-neutral-900">
          Verified emails
        </p>
        <div>
          {!userVerifiedEmails.length && (
            <p className="text-sm text-neutral-700">No verified emails</p>
          )}

          {userVerifiedEmails.map((email) => (
            <div className="flex items-center gap-1 text-sm" key={email.id}>
              <p className="w-fit rounded-lg bg-neutral-50 px-2 py-1 text-sm">
                {email.email}
              </p>
              {email.verifiedOn && (
                <p>
                  - Verified on{" "}
                  {new Intl.DateTimeFormat(undefined, {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  }).format(email.verifiedOn)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <p className="text-base font-semibold text-neutral-900">Actions</p>
        <div>
          <Server_LogOut
            className={buttonVariants({
              variant: "destructive",
            })}
            preventDefaultStyles={true}
            sessionId={userAuthData.session!.id}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
