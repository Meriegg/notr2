"use client";

import Link from "next/link";
import { BlocksIcon, ChevronLeft, PlusIcon, SearchIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { Button, buttonVariants } from "../ui/button";
import { FileTreeDisplay } from "./file-tree-display";
import { useFileTree } from "~/lib/zustand/file-tree";
import { useRouter } from "next/navigation";
import { FileTreeActions } from "./file-tree-actions";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Skeleton } from "../ui/skeleton";

export const Sidebar = () => {
  const [isClosed, setIsClosed] = useState(false);
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
      apiUtils.user.getUserFileTree
        .invalidate()
        .catch((error) => console.error(error));
      router.push(`/application/${data.noteId}`);
    },
  });

  return (
    <div
      className={cn(
        "flex max-h-[100vh] min-h-[100vh] flex-col gap-0 overflow-y-auto border-r-[1px] bg-white transition-all duration-300",
        isClosed ? "w-[100px]" : "w-[300px]",
        !isClosed && "fixed inset-0 z-[50] w-[300px] md:relative",
      )}
    >
      {!userData.isLoading && !userData.isError && (
        <div className="group relative w-full border-b-[1px] border-neutral-100 p-4 text-sm text-neutral-900 hover:bg-neutral-50">
          <Link href="/application/account">
            <p className="font-semibold">{userData.data?.userData?.username}</p>
            <p className="truncate text-neutral-700">
              {userData.data?.userData?.email}
            </p>
          </Link>
          <div className="absolute right-0 top-0 flex h-full items-center justify-center bg-white px-2 transition-all duration-300 group-hover:opacity-100 md:opacity-0">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setIsClosed(!isClosed)}
            >
              <ChevronLeft
                className={cn(
                  "h-3 w-3 rotate-0 transform transition-all duration-300",
                  isClosed && "rotate-180",
                )}
              />
            </Button>
          </div>
        </div>
      )}
      {userData.isLoading && (
        <div className="w-full p-2">
          <Skeleton className="h-[62px] w-full" />
        </div>
      )}

      {!userData.isLoading && !userData.isError && (
        <>
          <div className="flex max-w-full flex-col gap-1 px-2 py-1">
            <Link
              href="/application/search"
              className={buttonVariants({
                className: "w-full !justify-start gap-2 !text-left",
                variant: "ghost",
                size: "sm",
              })}
            >
              <SearchIcon className="max-h-3 min-h-3 min-w-3 max-w-3 text-inherit" />{" "}
              <span className="truncate">Search</span>
            </Link>

            <Button
              className="w-full justify-start gap-2 text-left"
              variant="ghost"
              size="sm"
              onClick={() => newNote.mutate()}
            >
              <PlusIcon className="max-h-3 min-h-3 min-w-3 max-w-3 text-inherit" />{" "}
              <span className="truncate">New note</span>
            </Button>

            <Link
              href="/application/extensions"
              className={buttonVariants({
                className: "w-full !justify-start gap-2 !text-left",
                variant: "ghost",
                size: "sm",
              })}
            >
              <BlocksIcon className="max-h-3 min-h-3 min-w-3 max-w-3 text-inherit" />{" "}
              <span className="truncate">Connected extensions</span>{" "}
            </Link>
          </div>
          <hr className="border-neutral-100" />
        </>
      )}

      {userData.isLoading && (
        <div className="flex max-w-full flex-col gap-1 px-2 py-1">
          {Array.from(new Array(3)).map((_, i) => (
            <Skeleton className="h-[35px] w-full rounded-md" key={i} />
          ))}
        </div>
      )}

      {userFileTree.isLoading && (
        <div className="flex max-h-full flex-col gap-1 overflow-y-auto px-2 pt-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-[20px] w-[55px]" />

            <div className="flex items-center gap-1">
              <Skeleton className="h-[30px] w-[30px]" />
              <Skeleton className="h-[30px] w-[30px]" />
            </div>
          </div>

          {Array.from(new Array(5)).map((_, i) => (
            <Skeleton className="h-[35px] w-full rounded-md" key={i} />
          ))}
        </div>
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
