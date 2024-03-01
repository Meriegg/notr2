"use client";

import type { InferSelectModel } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { deleteAppClientCache } from "next/dist/server/lib/render-server";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { authorizedExtensions } from "~/server/db/schema";
import { api } from "~/trpc/react";

interface Props {
  extension: InferSelectModel<typeof authorizedExtensions>;
}

export const ExtensionDisplay = ({ extension }: Props) => {
  const [showDates, setShowDates] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const deleteExtension = api.extensions.deleteAuthorization.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "Unable to delete extension.",
      });
    },
  });

  const setExtensionSuspended =
    api.extensions.setExtensionSuspended.useMutation({
      onSuccess: () => {
        router.refresh();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message ?? "Unable to set suspended state.",
        });
      },
    });

  useEffect(() => {
    setShowDates(true);
  }, []);

  return (
    <div className="flex w-full flex-col gap-1 py-2">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium text-neutral-900">
          {extension.extensionName}{" "}
          {extension.isRestricted && (
            <span className="rounded-full bg-red-50 px-2 py-1 text-sm text-red-900">
              Restricted
            </span>
          )}
        </p>

        {showDates && (
          <p className="text-sm text-neutral-700">
            {!!extension.authorizedOn
              ? `Authorized on: ${new Intl.DateTimeFormat().format(extension.authorizedOn)}`
              : "Not authorized yet"}{" "}
            &bull; Created on:{" "}
            {new Intl.DateTimeFormat().format(extension.issuedOn)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-700">{extension.id}</p>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 text-sm text-red-900 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
            disabled={deleteExtension.isLoading}
            onClick={() => deleteExtension.mutate({ extId: extension.id })}
          >
            Delete{" "}
            {deleteExtension.isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-inherit" />
            )}
          </button>

          <button
            className="flex items-center gap-1 text-sm text-red-900 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
            disabled={setExtensionSuspended.isLoading}
            onClick={() =>
              setExtensionSuspended.mutate({
                extId: extension.id,
                isSuspended: !extension.isRestricted,
              })
            }
          >
            {extension.isRestricted ? "Allow access" : "Suspend Access"}{" "}
            {setExtensionSuspended.isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-inherit" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
