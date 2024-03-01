"use client";

import { Loader2, PlusIcon } from "lucide-react";
import StaticGenerationSearchParamsBailoutProvider from "next/dist/client/components/static-generation-searchparams-bailout-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export const LinkExtensionBtn = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [authorizationToken, setAuthorizationToken] = useState<string | null>(
    null,
  );
  const [extensionName, setExtensionName] = useState("");

  const linkNewExtMutation = api.extensions.linkNewExtension.useMutation({
    onSuccess: (data) => {
      setAuthorizationToken(data.authorizationToken);
      setIsTokenDialogOpen(true);
      setExtensionName("");
      router.refresh();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "Unable to authorize a new extension.",
      });
    },
    onSettled: () => {
      setIsAlertDialogOpen(false);
    },
  });

  return (
    <>
      <Dialog
        open={isTokenDialogOpen}
        onOpenChange={(val) => {
          setIsTokenDialogOpen(val);

          if (!val) {
            setAuthorizationToken("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authorization token</DialogTitle>
            <DialogDescription>
              Please copy the authorization token below and paste it into your
              extension authorization field. You will see this only once.
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={
              authorizationToken ?? "Error: no value present, please try again."
            }
            className="min-h-[150px] w-full rounded-lg border-[1px] border-neutral-100 px-2 py-2 text-sm"
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Link new extension <PlusIcon className="h-3 w-3 text-inherit" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Give your extension a name</AlertDialogTitle>
            <AlertDialogDescription>Ex: a device name</AlertDialogDescription>
          </AlertDialogHeader>

          <Input
            placeholder="Extension name"
            value={extensionName}
            onChange={(e) => setExtensionName(e.target.value)}
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();

                linkNewExtMutation.mutate({
                  extensionName,
                });
              }}
              className="flex items-center gap-1"
              disabled={!extensionName || linkNewExtMutation.isLoading}
            >
              Continue{" "}
              {linkNewExtMutation.isLoading && (
                <Loader2 className="h-3 w-3 animate-spin text-inherit" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
