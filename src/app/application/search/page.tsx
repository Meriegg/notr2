import { db } from "~/server/db";
import { SearchInput } from "./search-input";
import { notes } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

const Page = async ({
  searchParams: { query },
}: {
  searchParams: { query?: string | null };
}) => {
  const results = !!query
    ? await db
        .select()
        .from(notes)
        .where(
          sql`to_tsvector(${notes.title} || ' ' || ${notes._parsedtextcontent}) @@ websearch_to_tsquery(${query ?? ""})`,
        )
    : null;

  return (
    <div className="p-4 md:p-8">
      <SearchInput />
      <p className="my-2 text-sm text-neutral-900">
        <span className="text-neutral-700">Query:</span> {query ?? "No query"}
      </p>

      <hr className="my-1 border-neutral-100" />

      {!results?.length && (
        <p className="my-4 text-center text-sm text-neutral-700">No results</p>
      )}

      <div className="flex flex-col gap-1">
        {!!results?.length &&
          results.map((result) => (
            <Link
              href={`/application/${result.id}`}
              className="flex items-center justify-between gap-4 rounded-md border-neutral-100 bg-neutral-50 px-3 py-2 shadow-sm hover:opacity-70"
              key={result.id}
            >
              <div>
                <p className="font-semibold text-neutral-900">{result.title}</p>
                <p className="text-sm text-neutral-700">
                  {result?._parsedtextcontent?.toString() ?? "No content"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tags?.map((tag, i) => (
                  <div
                    className="text-sm font-semibold text-neutral-700"
                    key={i}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Page;
