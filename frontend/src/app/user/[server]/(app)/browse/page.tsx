import { redirect } from "next/navigation";

import MangaCard from "@/components/domain/manga/MangaCard";
import UrlSorting from "@/components/query/UrlSorting";
import UrlPagination from "@/components/query/UrlPagination";
import ToastForServer from "@/components/domain/server/ToastForServer";
import MangasGridSection from "@/components/sections/MangasGridSection";

import { listMangas } from "@/server/manga/manga.action";
import { MangaPrams, Server } from "@/types/manga.type";

import { isSortValid } from "@/utils/sorting.utils";
import { toSearchParamsString } from "@/utils/params.utils";
import { isPageValid, clampPage } from "@/utils/pagination.utils";

export default async function BrowsePage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page: string; q: string; sort: string }>;
  params: Promise<{ server: Server }>;
}) {
  const { page, q, sort } = await searchParams;
  const { server } = await params;

  const parsedParams: MangaPrams = {
    page: Number(page),
    query: q ?? "",
    sort: isSortValid(sort) ? sort : "date",
    server,
  };

  const mangasRes = await listMangas(parsedParams);

  if (!mangasRes.ok) {
    return (
      <ToastForServer
        type="error"
        title="Failed to fetch mangas"
        description={mangasRes.error}
      />
    );
  }

  const mangas = mangasRes.value.mangas;
  const total_pages = mangasRes.value.total_pages;

  console.log(mangas);
  

  if (!isSortValid(sort) || !isPageValid(page, total_pages)) {
    const search = {
      q: parsedParams.query,
      page: clampPage(page, total_pages, 1),
      sort: parsedParams.sort,
    };    
    redirect(`/user/${server}/browse?${toSearchParamsString(search)}`);
  }

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

      <UrlPagination totalPages={total_pages} />
      <UrlSorting />
      <MangasGridSection>
        {mangas.length > 0 ? (
          mangas.map((manga) => (
            <MangaCard
              key={manga.manga_id}
              manga={manga}
              href={`/user/${server}/manga/${manga.manga_id}`}
            />
          ))
        ) : (
          <p className="text-sm fg-muted h-screen">No mangas found.</p>
        )}
      </MangasGridSection>
      <UrlPagination totalPages={total_pages} />
    </main>
  );
}
