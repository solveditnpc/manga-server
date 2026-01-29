import { FullManga } from "@/types/manga.type";

import { MangaFallback } from "@/config/manga.config";
import Reader from "@/components/domain/read/Reader";
import { clampPage } from "@/utils/pagination.utils";
import { getMangaDetails } from "@/server/manga/manga.action";
import ToastForServer from "@/components/domain/server/ToastForServer";

export default async function MangaReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page: string }>;
}) {
  const { id } = await params;
  const { page } = await searchParams;

  const res = await getMangaDetails({ id: Number(id), server: "S" });

  if (!res.ok)
    return (
      <ToastForServer
        type={"error"}
        title="Error Ferching Manga"
        description={res.error}
      />
    );
  console.log(res.value);

  const manga: FullManga = res.value || MangaFallback;

  const parsedPage = clampPage(page, manga.total_pages, 1);

  const pages = res.value.page_files;

  return <Reader pages={pages} manga={manga} initialPage={parsedPage} />;
}
