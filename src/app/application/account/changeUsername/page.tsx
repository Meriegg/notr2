import { eq } from "drizzle-orm";
import { XIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { getUserAuthData } from "~/server/utils/auth/get-user-auth-data";

const Page = async ({
  searchParams: { error },
}: {
  searchParams: { error?: string | null };
}) => {
  return (
    <div
      className="p-4 lg:p-8"
      style={{
        width: "min(450px, 100%)",
      }}
    >
      {error && (
        <Alert variant="destructive" className="mb-2">
          <XIcon className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <h1 className="text-2xl font-semibold text-neutral-900">
        Change username
      </h1>
      <p className="text-sm text-neutral-700">
        Enter your new username to continue
      </p>

      <form
        className="mt-4 flex w-full flex-col gap-1"
        action={async (data) => {
          "use server";
          const ValidationSchema = z.object({
            newUsername: z.string().min(1),
            confirmNewUsername: z.string().min(1),
          });

          const { success } = ValidationSchema.safeParse({
            newUsername: data.get("newUsername")?.toString()?.trim(),
            confirmNewUsername: data
              .get("confirmNewUsername")
              ?.toString()
              ?.trim(),
          });
          if (!success) {
            redirect(
              `/application/account/changeUsername?error=${"Invalid input."}`,
            );
          }

          const formData = {
            newUsername: data.get("newUsername"),
            confirmNewUsername: data.get("confirmNewUsername"),
          } as z.infer<typeof ValidationSchema>;

          if (formData.confirmNewUsername !== formData.newUsername) {
            redirect(
              `/application/account/changeUsername?error=${"Usernames must match."}`,
            );
          }

          const userAuthData = await getUserAuthData();
          if (userAuthData.error) {
            redirect("/login");
          }

          const [userData] = await db
            .update(users)
            .set({
              username: formData.newUsername,
            })
            .where(eq(users.id, userAuthData.userData!.id))
            .returning({ userId: users.id });
          if (!userData?.userId) {
            redirect(
              `/application/account/changeUsername?error=${"Unable to change username."}`,
            );
          }

          redirect(
            "/application/refetch-client-user-data?redirectTo=/application/account",
          );
        }}
      >
        <Input placeholder="New username" name="newUsername" />
        <Input placeholder="Confirm new username" name="confirmNewUsername" />

        <Button type="submit" className="w-fit">
          Change username
        </Button>
      </form>
    </div>
  );
};

export default Page;
