"use client";

import "@blocknote/react/style.css";
import { useDebounce } from "use-debounce";
import { useForm } from "react-hook-form";
import { BlockNoteEditor, BlockSchema } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import { Button } from "../ui/button";
import {
  CheckIcon,
  Loader2,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { notes } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface Props {
  note: InferSelectModel<typeof notes>;
}

export const Editor = ({ note }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [currentTag, setCurrentTag] = useState("");
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [tagsContainerRef] = useAutoAnimate();

  const ValidationSchema = z.object({
    title: z.string(),
    content: z.string(),
    tags: z.string().array(),
    _parsedtextcontent: z.string(),
  });

  type FormData = z.infer<typeof ValidationSchema>;

  const form = useForm<FormData>({
    defaultValues: {
      title: note.title,
      content: note.content,
      tags: note.tags ?? [],
      _parsedtextcontent: "",
    },
  });

  const editor: BlockNoteEditor = useBlockNote({
    onEditorContentChange: (editor) => {
      let finalText = "";

      editor.forEachBlock((block) => {
        finalText += "\n";

        switch (block.type) {
          case "paragraph":
            block.content.forEach((entry) => {
              if (entry.type === "text") finalText += entry.text;
              if (entry.type === "link") finalText += entry.href;
            });
            break;
          case "heading":
            block.content.forEach((entry) => {
              if (entry.type === "text") finalText += entry.text;
              if (entry.type === "link") finalText += entry.href;
            });
            break;
          case "bulletListItem":
            block.content.forEach((entry) => {
              if (entry.type === "text") finalText += entry.text;
              if (entry.type === "link") finalText += entry.href;
            });
            break;
          case "numberedListItem":
            block.content.forEach((entry) => {
              if (entry.type === "text") finalText += entry.text;
              if (entry.type === "link") finalText += entry.href;
            });
            break;
          case "table":
            block.content.rows.forEach((row) => {
              row.cells.forEach((cell) => {
                cell.forEach((entry) => {
                  if (entry.type === "text") finalText += entry.text;
                  if (entry.type === "link") finalText += entry.href;
                });
              });
            });
            break;
        }

        return true;
      });

      form.setValue("_parsedtextcontent", finalText);
      form.setValue("content", JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    initialContent: !!form.watch("content")
      ? (JSON.parse(form.watch("content")) as BlockSchema[])
      : undefined,
  });

  const [formData] = useDebounce(form.watch(), 750);

  const apiUtils = api.useUtils();
  const updateNote = api.user.updateNote.useMutation({
    onSuccess: () => {
      apiUtils.user.getUserFileTree
        .invalidate()
        .catch((error) => console.error(error));
      apiUtils.user.getNote.invalidate().catch((error) => console.error(error));
    },
  });

  const deleteNote = api.user.deleteNote.useMutation({
    onSuccess: () => {
      apiUtils.user.getUserFileTree
        .invalidate()
        .catch((error) => console.error(error));
      router.push("/application");
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error?.message ?? "Unable to delete note.",
      });
    },
  });

  useEffect(() => {
    updateNote.mutate({
      noteId: note.id,
      ...form.getValues(),
    });
  }, [JSON.stringify(formData)]);

  return (
    <div
      className="mx-auto mt-12 flex max-w-full flex-col gap-2 px-2"
      style={{
        width: "min(1100px, 100%)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2" ref={tagsContainerRef}>
        {form.watch("tags").map((tag, i) => (
          <Button
            onClick={() => {
              form.setValue(
                "tags",
                form.getValues("tags").filter((_, tagIdx) => tagIdx !== i),
              );
            }}
            variant="outline"
            size="sm"
            className="gap-1"
            key={i}
          >
            {tag} <XIcon className="h-3 w-3 text-inherit" />
          </Button>
        ))}

        <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="mt-1 w-fit items-center gap-2 !px-4 !py-2"
            >
              <PlusIcon className="h-3 w-3 text-inherit" /> Add tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a tag</DialogTitle>
            </DialogHeader>

            <div className="flex w-full flex-col gap-1">
              <Input
                placeholder="Tag"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={() => {
                  if (!currentTag) return;

                  form.setValue("tags", [
                    ...form.getValues("tags"),
                    currentTag,
                  ]);

                  setIsTagDialogOpen(false);
                  setCurrentTag("");
                }}
              >
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <input
        className="w-full border-none bg-transparent text-4xl font-bold focus:outline-none"
        placeholder="Untitled"
        {...form.register("title")}
      />

      <div className="mt-2 flex w-full justify-between">
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-1 text-xs font-semibold text-red-900">
                <TrashIcon className="h-3 w-3 text-inherit" /> Delete this note
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this note.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <button
                    className="flex items-center gap-2 disabled:opacity-70"
                    disabled={deleteNote.isLoading}
                    onClick={() => deleteNote.mutate({ noteId: note.id })}
                  >
                    {deleteNote.isLoading && (
                      <Loader2 className="h-3 w-3 animate-spin text-inherit" />
                    )}{" "}
                    Continue
                  </button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {updateNote.isLoading && (
          <p className="flex items-center gap-1 text-xs font-semibold text-neutral-700">
            <Loader2 className="h-3 w-3 animate-spin text-inherit" /> Saving
          </p>
        )}

        {!updateNote.isLoading && !updateNote.isError && updateNote.data && (
          <p className="flex items-center gap-1 text-xs font-semibold text-green-900">
            <CheckIcon className="h-3 w-3 text-inherit" /> Saved{" "}
            <span className="font-medium uppercase text-neutral-700">
              &#183;{" "}
              {new Intl.DateTimeFormat(undefined, {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).format(updateNote.data.editDate)}
            </span>
          </p>
        )}

        {updateNote.isError && (
          <p className="flex items-center gap-1 text-xs font-semibold text-green-900">
            <XCircleIcon className="h-3 w-3 text-inherit" /> Error
          </p>
        )}
      </div>

      <hr className="border-neutral-100" />

      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
};
