"use client";

import { ChevronDown, ChevronUp, NotebookIcon } from "lucide-react";
import { useState } from "react";
import { FileTreeItem } from "~/server/api/routers/user";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";

interface Props {
  fileTree: FileTreeItem[];
}

export const FileTreeDisplay = ({ fileTree }: Props) => {
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      {!fileTree.length && (
        <p className="text-left text-xs font-semibold text-neutral-700">
          No files.
        </p>
      )}
      {fileTree.map((entry, i) => (
        <div key={i}>
          {entry.type === "folder" ? (
            <div className="flex flex-col gap-1">
              <Button
                className="flex w-full items-center justify-between"
                variant="outline"
                size="sm"
                onClick={() => setIsFolderOpen(!isFolderOpen)}
              >
                {entry.entryName}{" "}
                {isFolderOpen ? (
                  <ChevronUp className="h-3 w-3 text-inherit" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-inherit" />
                )}
              </Button>
              {isFolderOpen && (
                <div className="pl-4">
                  <FileTreeDisplay fileTree={entry.content} />
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/application/${entry.noteId}`}
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className:
                  "flex w-full items-center !justify-start gap-2 text-left",
              })}
            >
              <NotebookIcon className="h-3 w-3 text-inherit" />
              {entry.entryName}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};
