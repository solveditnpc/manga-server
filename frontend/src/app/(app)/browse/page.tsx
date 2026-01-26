import UrlPagination from "@/components/query/UrlPagination";
import UrlSorting from "@/components/query/UrlSorting";
import MangasGridSection from "@/components/sections/MangasGridSection";
import MangaCard from "@/components/domain/manga/MangaCard";
import { listMangas, getTotalPages } from "@/client/mangas.client";
import { redirect } from "next/navigation";
import { isPageValid, clampPage } from "@/utils/pagination.utils";
import { isSortValid } from "@/utils/sorting.utils";
import { toSearchParamsString } from "@/utils/params.utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; q: string; sort: string }>;
}) {
  const { page, q, sort } = await searchParams;

  const safeParams = {
    page: clampPage(page, 100, 1),
    query: q ?? "",
    sort: isSortValid(sort) ? sort : "date",
  };
  const totalPages = await getTotalPages("all");

  if (!isSortValid(sort) || !isPageValid(page, totalPages))
    redirect(`/browse?${toSearchParamsString(safeParams)}`);

  const mangas = await listMangas(safeParams);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-2">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold fg-primary">
          Browse Manga Library
        </h1>
        <p className="text-sm fg-muted">
          Search, sort, and discover stories you’ll love.
        </p>
      </header>
      <div className="border-b border-default mb-3" />

      <UrlPagination totalPages={totalPages} />
      <UrlSorting />
      <MangasGridSection>
        {mangas.length > 0 ? (
          mangas.map((manga) => (
            <MangaCard key={manga.manga_id} manga={manga} />
          ))
        ) : (
          <p className="text-sm fg-muted h-screen">No mangas found.</p>
        )}
      </MangasGridSection>
      <UrlPagination totalPages={totalPages} />
    </main>
  );
}
