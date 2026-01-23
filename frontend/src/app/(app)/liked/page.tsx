import UrlPagination from "@/components/query/UrlPagination";
import LikedMangasManager from "@/components/domain/manga/LikedMangasManager";
import { listLikedMangas, getTotalPages } from "@/client/mangas.client";
import { redirect } from "next/navigation";
import { isPageValid, clampPage } from "@/utils/pagination.utils";

export default async function LikedPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const { page } = await searchParams;
  const totalPages = await getTotalPages("liked");

  const safePage = clampPage(page, totalPages, 1);
  if (!isPageValid(page, totalPages))
    return redirect(`/liked?page=${safePage}`);

  const mangas = await listLikedMangas({ page: safePage });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-2">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold fg-primary">LIked By You</h1>
        <p className="text-sm fg-muted">Stories you enjoyed.</p>
      </header>
      <div className="border-b border-default mb-3" />

      {/* Continue */}
      <LikedMangasManager
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
