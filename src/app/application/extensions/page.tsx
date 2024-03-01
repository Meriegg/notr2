import { db } from "~/server/db";
import { LinkExtensionBtn } from "./components/link-extension-button";
import { authorizedExtensions } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import { getUserAuthData } from "~/server/utils/auth/get-user-auth-data";
import { redirect } from "next/navigation";
import { ExtensionDisplay } from "./components/extension-display";

const Page = async () => {
  const userAuthData = await getUserAuthData();
  if (userAuthData.error) {
    redirect("/login");
  }

  const extensions = await db
    .select()
    .from(authorizedExtensions)
    .where(sql`${authorizedExtensions.userId} = ${userAuthData.userData!.id}`);

  return (
    <div className="w-full p-4 md:p-8">
      <div className="flex items-center justify-between gap-2">
        <p className="text-2xl font-medium text-neutral-900">
          Manage extensions
        </p>

        <LinkExtensionBtn />
      </div>

      {!extensions?.length && (
        <p className="my-8 w-full text-center text-sm text-neutral-700">
          You don't have any connected extensions
        </p>
      )}

      <div className="my-2 divide-y divide-neutral-100">
        {extensions.map((extension) => (
          <ExtensionDisplay extension={extension} key={extension.id} />
        ))}
      </div>
    </div>
  );
};

export default Page;
