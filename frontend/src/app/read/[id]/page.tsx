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
  searchParams: Promise<{ page: string; chapter: string }>;
}) {
  const { id } = await params;
  const { page, chapter } = await searchParams;

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
  let pages;
  let parsedPage;
  let chapterTitle = "";
  if (chapter) {
    const ch = res.value.chapters.filter((ch) => ch.title === chapter)[0];
    pages = ch.images;
    parsedPage = clampPage(page, pages.length, 1);
    chapterTitle = ch.title;
  } else {
    pages = res.value.page_files;
    parsedPage = clampPage(page, manga.total_pages, 1);
  }

  return (
    <Reader
      pages={pages}
      manga={manga}
      initialPage={parsedPage}
      chapterTitle={chapterTitle}
    />
  );
}
