"use client";

import { ChevronDown, ChevronUp, NotebookIcon } from "lucide-react";
import { useState } from "react";
import { FileTreeItem } from "~/server/api/routers/user";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { FileTreeActions } from "./file-tree-actions";

const EntryDisplay = ({ entry }: { entry: FileTreeItem }) => {
  const [isFolderOpen, setFolderOpen] = useState(false);

  return (
    <div>
      {entry.type === "folder" ? (
        <div className="flex flex-col gap-1">
          <div className="group relative">
            <Button
              className="flex w-full items-center justify-start gap-2 pl-2"
              variant="outline"
              size="sm"
              onClick={() => setFolderOpen(!isFolderOpen)}
            >
              {isFolderOpen ? (
                <ChevronUp className="max-h-3 min-h-3 min-w-3 max-w-3 text-inherit" />
              ) : (
                <ChevronDown className="max-h-3 min-h-3 min-w-3 max-w-3 text-inherit" />
              )}
              <span className="max-w-full truncate">{entry.entryName}</span>{" "}
            </Button>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 transform opacity-0 transition-all duration-300 group-hover:opacity-100">
              <FileTreeActions parentFolderId={entry.folderId} />
            </div>
          </div>

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
            variant: "ghost",
            size: "sm",
            className:
              "flex w-full items-center !justify-start gap-2 text-left",
          })}
        >
          <NotebookIcon className="max-h-3 min-h-3 min-w-3 max-w-3 text-inherit" />
          <span className="max-w-full truncate">{entry.entryName}</span>
        </Link>
      )}
    </div>
  );
};

interface Props {
  fileTree: FileTreeItem[];
}

export const FileTreeDisplay = ({ fileTree }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      {!fileTree.length && (
        <p className="text-left text-xs font-semibold text-neutral-700">
          No files.
        </p>
      )}
      {fileTree.map((entry, i) => (
        <EntryDisplay entry={entry} key={i} />
      ))}
    </div>
  );
};
