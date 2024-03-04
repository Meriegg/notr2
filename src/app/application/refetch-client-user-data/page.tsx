"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

const Page = () => {
  const searchParams = useSearchParams();
  const apiUtils = api.useUtils();
  const router = useRouter();
  apiUtils.user
    .invalidate()
    .catch((error) => console.error(error))
    .finally(() => {
      const redirectTo = searchParams.get("redirectTo");

      router.push(redirectTo ?? "/application");
    });

  return (
    <p className="flex w-full items-center gap-1 text-center text-sm text-neutral-700">
      Wait a moment. <Loader2 className="h-3 w-3 animate-spin text-inherit" />
    </p>
  );
};

export default Page;
