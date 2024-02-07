"use client";

import "@blocknote/react/style.css";
import { useForm } from "react-hook-form";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { notes } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { z } from "zod";

interface Props {
  note: InferSelectModel<typeof notes>;
}

export const Editor = ({ note }: Props) => {
  const editor: BlockNoteEditor = useBlockNote({
    onEditorContentChange: (val) => {
      console.log(val);
    },
  });

  const ValidationSchema = z.object({
    title: z.string(),
    content: z.string(),
    tags: z.string().array(),
  });

  type FormData = z.infer<typeof ValidationSchema>;

  const form = useForm<FormData>({
    defaultValues: {
      title: note.title,
      content: note.content,
      tags: note.tags ?? [],
    },
  });

  return (
    <div
      className="mx-auto mt-12 flex flex-col gap-2"
      style={{
        width: "min(1100px, 100%)",
      }}
    >
      <input
        className="w-full border-none bg-transparent text-4xl font-bold focus:outline-none"
        placeholder="Untitled"
        {...form.register("title")}
      />
      <Button
        variant="secondary"
        size="sm"
        className="w-fit items-center gap-2"
      >
        <PlusIcon className="h-3 w-3 text-inherit" /> Add tag
      </Button>

      <hr className="border-neutral-100" />

      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
};
