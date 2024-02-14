"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "~/components/ui/input";

export const SearchInput = () => {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [debouncedQuery] = useDebounce(searchVal, 750);

  useEffect(() => {
    if (!debouncedQuery) return;

    router.push(`/application/search?query=${debouncedQuery}`);
  }, [debouncedQuery]);

  return (
    <Input
      value={searchVal}
      onChange={(e) => setSearchVal(e.target.value)}
      placeholder="Your query"
    />
  );
};
