"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Editor } from "~/components/application/editor";
import { api } from "~/trpc/react";

const Page = () => {
  const params = useParams();
  const noteId = params.noteId;
  const apiUtils = api.useUtils();
  const note = api.user.getNote.useQuery(
    { noteId: (noteId as string) ?? "" },
    {
      onSuccess: () => {
        apiUtils.user.getUserFileTree
          .invalidate()
          .catch((error) => console.error(error));
      },
    },
  );

  if (note.isLoading) {
    return (
      <Loader2 className="my-12 flex h-4 w-full animate-spin justify-center text-neutral-900" />
    );
  }

  if (note.isError) {
    return (
      <p className="my-12 w-full text-center text-sm font-semibold text-neutral-700">
        Error: {note.error?.message ?? "Error fetching note."}
      </p>
    );
  }

  if (!noteId) {
    return <p>Invalid params.</p>;
  }

  return <Editor note={note.data} />;
};

export default Page;
