"use client";

import { BlocksIcon, Loader2, PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { FileTreeDisplay } from "./file-tree-display";
import { useFileTree } from "~/lib/zustand/file-tree";
import { useRouter } from "next/navigation";
import { FileTreeActions } from "./file-tree-actions";

export const Sidebar = () => {
  const fileTree = useFileTree();
  const router = useRouter();
  const userData = api.user.userData.useQuery();
  const apiUtils = api.useUtils();
  const userFileTree = api.user.getUserFileTree.useQuery(undefined, {
    onSuccess: (data) => {
      fileTree.setFileTree(data.fileTree);
    },
  });

  const newNote = api.user.createNote.useMutation({
    onSuccess: (data) => {
      apiUtils.user.getUserFileTree.invalidate();
      router.push(`/application/${data.noteId}`);
    },
  });

  return (
    <div className="flex max-h-[100vh] min-h-[100vh] w-[300px] flex-col gap-0 overflow-y-auto border-r-[1px]">
      <Link
        href="/application/account"
        className="w-full border-b-[1px] border-neutral-100 p-4 text-sm text-neutral-900 hover:bg-neutral-50"
      >
        {userData.isLoading && (
          <Loader2 className="flex h-4 w-4 animate-spin items-center justify-center text-neutral-700" />
        )}
        {!userData.isLoading && !userData.isError && (
          <>
            <p className="font-semibold">{userData.data?.userData?.username}</p>
            <p className="truncate text-neutral-700">
              {userData.data?.userData?.email}
            </p>
          </>
        )}
      </Link>

      <div className="flex flex-col gap-1 px-2 py-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-left"
        >
          <SearchIcon className="h-3 w-3 text-inherit" /> Search
        </Button>

        <Button
          className="w-full justify-start gap-2 text-left"
          variant="ghost"
          size="sm"
          onClick={() => newNote.mutate()}
        >
          <PlusIcon className="h-3 w-3 text-inherit" /> New note
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-left"
        >
          <BlocksIcon className="h-3 w-3 text-inherit" /> Connected extensions{" "}
        </Button>
      </div>

      <hr className="border-neutral-100" />

      {userFileTree.isLoading && (
        <Loader2 className="my-2 flex h-4 w-full animate-spin items-center justify-center" />
      )}

      {userFileTree.isError && (
        <p className="w-full text-center text-sm font-semibold text-neutral-700">
          Unable to load file tree:{" "}
          {userFileTree?.error?.message ?? "Unable to fetch file tree"}
        </p>
      )}

      {!userFileTree.isLoading && !userFileTree.isError && (
        <div className="max-h-full overflow-y-auto px-2 pt-2">
          <div className="mb-1 flex w-full items-center justify-between">
            <p className="text-xs font-semibold text-neutral-700">Your files</p>

            <FileTreeActions />
          </div>

          <FileTreeDisplay fileTree={userFileTree.data.fileTree} />
        </div>
      )}
    </div>
  );
};
