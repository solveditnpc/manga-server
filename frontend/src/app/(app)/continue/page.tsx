import ContinueMangasManager from "@/components/domain/manga/ContinueMangasManager";
import UrlPagination from "@/components/query/UrlPagination";
import { listContinueMangas, getTotalPages } from "@/client/mangas.client";
import { redirect } from "next/navigation";
import { clampPage, isPageValid } from "@/utils/pagination.utils";

export default async function ContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const { page } = await searchParams;
  const totalPages = await getTotalPages("continue");
  const safePage = clampPage(page, totalPages, 1);
  if (!isPageValid(page, totalPages))
    return redirect(`/continue?page=${safePage}`);

  const mangas = await listContinueMangas({ page: safePage });

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
