import AdminAddMangaSection from "@/components/domain/admin/AdminAddMangaSection";
import AdminMangaSection from "@/components/domain/admin/AdminMangaSection";
import ToastForServer from "@/components/domain/server/ToastForServer";

import { clampPage, isPageValid } from "@/utils/pagination.utils";
import { toSearchParamsString } from "@/utils/params.utils";
import { isSortValid } from "@/utils/sorting.utils";

import { redirect } from "next/navigation";
import { listMangas } from "@/server/manga/manga.action";
import { MangaPrams } from "@/types/manga.type";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; q: string; sort: string }>;
}) {
  const { page, q, sort } = await searchParams;

  const safeParams: MangaPrams = {
    page: clampPage(page, 100, 1),
    query: q ?? "",
    sort: isSortValid(sort) ? sort : "date",
    server: "N",
  };
  const mangasRes = await listMangas(safeParams);
  if (!mangasRes.ok)
    return (
      <ToastForServer
        type="error"
        title="Failed to fetch mangas"
        description={mangasRes.error}
      />
    );

  const totalPages = !mangasRes.ok ? 0 : mangasRes?.value.total_pages;
  const initialMangas = !mangasRes.ok ? [] : mangasRes?.value.mangas;

  if (!isSortValid(sort) || !isPageValid(page, totalPages))
    redirect(`/admin?${toSearchParamsString({ ...safeParams, server: "" })}`);

  return (
    <div className="space-y-5">
      {/* Header */}
      <section>
        <h1 className="text-lg font-semibold fg-primary">Manga Management</h1>
        <p className="text-sm fg-muted">Search, add, or delete mangas.</p>
      </section>

      {/* Add */}
      <AdminAddMangaSection />

      {/* Mangas */}
      <AdminMangaSection
        initialMangas={initialMangas}
        totalBatches={totalPages}
        currentParams={safeParams}
      />
    </div>
  );
}
