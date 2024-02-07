"use client";

import {
  BlocksIcon,
  Loader,
  Loader2,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { FileTreeDisplay } from "./file-tree-display";

export const Sidebar = () => {
  const userData = api.user.userData.useQuery();
  const userFileTree = api.user.getUserFileTree.useQuery();

  return (
    <div className="flex max-h-[100vh] min-h-[100vh] w-[300px] flex-col gap-2 border-r-[1px] border-neutral-100">
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

      <div className="flex flex-col gap-1 px-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-left"
        >
          <SearchIcon className="h-3 w-3 text-inherit" /> Search
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-left"
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
        <Loader2 className="flex h-4 w-full animate-spin items-center justify-center" />
      )}

      {!userFileTree.isLoading && !userFileTree.isError && (
        <div className="px-2">
          <FileTreeDisplay fileTree={userFileTree.data?.fileTree} />
        </div>
      )}
    </div>
  );
};
