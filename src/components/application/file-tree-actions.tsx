"use client";

import { FilePlus, FolderPlus, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
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
import { Input } from "../ui/input";
import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { useToast } from "~/hooks/use-toast";

interface Props {
  parentFolderId?: string;
}

const FolderDeleteButton = ({ parentFolderId }: { parentFolderId: string }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const apiUtils = api.useUtils();
  const { toast } = useToast();
  const deleteFolder = api.user.deleteFolder.useMutation({
    onSuccess: () => {
      apiUtils.user.getUserFileTree.invalidate();
      router.push("/application");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "Failed to delete folder.",
      });
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <button className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-neutral-50">
          Delete folder
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this folder?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete this folder and any subfolder/note in this folder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteFolder.isLoading}
            onClick={(e) => {
              e.preventDefault();
              deleteFolder.mutate({ folderId: parentFolderId });
            }}
          >
            {deleteFolder.isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-inherit" />
            )}{" "}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const FolderRenameNameButton = ({
  parentFolderId,
}: {
  parentFolderId: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const apiUtils = api.useUtils();
  const { toast } = useToast();
  const renameFolder = api.user.renameFolder.useMutation({
    onSuccess: () => {
      apiUtils.user.getUserFileTree.invalidate();
      setNewName("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "Failed to rename folder.",
      });
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <button className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-neutral-50">
          Rename folder
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename folder</AlertDialogTitle>
          <AlertDialogDescription>
            Please enter a new name for this folder.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder="New name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              if (!newName) return;

              await renameFolder.mutateAsync({
                folderId: parentFolderId,
                newName,
              });
            }}
            disabled={renameFolder.isLoading || !newName}
          >
            {renameFolder.isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-inherit" />
            )}{" "}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const CreateFolderButton = ({ parentFolderId }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const { toast } = useToast();
  const apiUtils = api.useUtils();
  const newFolder = api.user.createFolder.useMutation({
    onSuccess: () => {
      apiUtils.user.getUserFileTree.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "Failed to create folder.",
      });
    },
    onSettled: () => {
      setIsDialogOpen(false);
    },
  });

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-[30px] w-[30px]"
          size="icon"
          title="New folder"
        >
          <FolderPlus className="h-3 w-3 text-inherit" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a new folder</AlertDialogTitle>
          <AlertDialogDescription>
            Please enter a name for the new folder.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Input
          onChange={(e) => setFolderName(e.target.value)}
          value={folderName}
          placeholder="folder name"
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={newFolder.isLoading}
            onClick={(e) => {
              e.preventDefault();
              if (!folderName) return;

              newFolder.mutate({ folderName, parentFolderId });
            }}
          >
            {newFolder.isLoading && (
              <Loader2 className="h-3 w-3 animate-spin text-inherit" />
            )}
            Create folder
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const FileTreeActions = ({ parentFolderId }: Props) => {
  const router = useRouter();
  const apiUtils = api.useUtils();
  const newNote = api.user.createNote.useMutation({
    onSuccess: (data) => {
      apiUtils.user.getUserFileTree.invalidate();
      router.push(`/application/${data.noteId}`);
    },
  });

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        className="h-[30px] w-[30px]"
        size="icon"
        title="New note"
        onClick={() =>
          newNote.mutate({
            folderId: parentFolderId,
          })
        }
      >
        <FilePlus className="h-3 w-3 text-inherit" />
      </Button>

      <CreateFolderButton parentFolderId={parentFolderId} />

      {parentFolderId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-[30px] w-[30px]"
              size="icon"
              title="New folder"
            >
              <DotsHorizontalIcon className="h-3 w-3 text-inherit" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <FolderDeleteButton parentFolderId={parentFolderId} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <FolderRenameNameButton parentFolderId={parentFolderId} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
