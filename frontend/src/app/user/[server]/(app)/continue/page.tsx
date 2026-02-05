import { redirect } from "next/navigation";

import ContinueMangasManager from "@/components/domain/manga/ContinueMangasManager";
import UrlPagination from "@/components/query/UrlPagination";
import ToastForServer from "@/components/domain/server/ToastForServer";
import { headers } from "next/headers";
import { listContinueMangas } from "@/server/manga/manga.action";
import { clampPage, isPageValid } from "@/utils/pagination.utils";
import { Server } from "@/types/manga.type";

export default async function ContinuePage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page: string }>;
  params: Promise<{ server: Server }>;
}) {
  const { page } = await searchParams;
  const pageNum = Number(page) || 1;
  const { server } = await params;

  const mangasRes = await listContinueMangas({
    page: Number.isInteger(pageNum) ? pageNum : 1,
    server,
  });

  if (!mangasRes.ok)
    return (
      <ToastForServer
        type="error"
        title="Failed to fetch mangas"
        description={mangasRes.error}
      />
    );

  const mangas = mangasRes.value.mangas;
  const totalPages = mangasRes.value.total_pages;
  const safePage = clampPage(page, totalPages, 1);

  if (!isPageValid(page, totalPages)) {
    const header = await headers();

    return redirect(`${header.get("x-pathname")}?page=${safePage}`);
  }
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-2">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold fg-primary">Continue Reading</h1>
        <p className="text-sm fg-muted">Pick up where you left off.</p>
      </header>
      <div className="border-b border-default mb-3" />

      {/* Continue */}
      <ContinueMangasManager
        pageMangas={mangas}
        page={safePage}
        totalPages={totalPages}
      />

      {/* Pagination */}
      <div className="flex justify-center pt-4">
        <UrlPagination totalPages={totalPages} />
      </div>
    </main>
  );
}
