import UrlPagination from "@/components/query/UrlPagination";
import LikedMangasManager from "@/components/domain/manga/LikedMangasManager";
import { redirect } from "next/navigation";
import { isPageValid, clampPage } from "@/utils/pagination.utils";
import { listLikedMangas } from "@/server/manga/manga.action";
import ToastForServer from "@/components/domain/server/ToastForServer";

export default async function LikedPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) {
  const { page } = await searchParams;

  const res = await listLikedMangas({ page: Number(page) });

  if (!res.ok)
    return (
      <ToastForServer
        type="error"
        title="Failed to fetch mangas"
        description={res.error}
      />
    );

  const mangas = res.value.mangas;
  const totalPages = res.value.total_pages;

  const safePage = clampPage(page, totalPages, 1);
  if (!isPageValid(page, totalPages))
    return redirect(`/liked?page=${safePage}`);

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
