import AdminAddMangaSection from "@/components/domain/admin/AdminAddMangaSection";
import AdminMangaSection from "@/components/domain/admin/AdminMangaSection";
import { getTotalPages, listMangas } from "@/client/mangas.client";
import { clampPage, isPageValid } from "@/utils/pagination.utils";
import { isSortValid } from "@/utils/sorting.utils";
import { redirect } from "next/navigation";
import { toSearchParamsString } from "@/utils/params.utils";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; q: string; sort: string }>;
}) {
  const { page, q, sort } = await searchParams;

  const safeParams = {
    page: clampPage(page, 100 , 1),
    query: q ?? "",
    sort: isSortValid(sort) ? sort : "date",
  };
  const totalPages = await getTotalPages("all");

  if (!isSortValid(sort) || !isPageValid(page, totalPages))
    redirect(`/admin?${toSearchParamsString(safeParams)}`);

  const initialMangas = await listMangas(safeParams);

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
