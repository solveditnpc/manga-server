import { FullContinueManga } from "@/types/manga.type";
import { MangaFallback } from "@/config/manga.config";
import Reader from "@/components/domain/read/Reader";
import ToastForServer from "@/components/domain/server/ToastForServer";

import { getReaderData } from "@/server/manga/manga.action";
import { clampPage } from "@/utils/pagination.utils";

export default async function MangaReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page: string; chapter: string }>;
}) {
  const { id } = await params;
  const { page, chapter } = await searchParams;

  const res = await getReaderData({ manga_id: Number(id), server: "S" });

  if (!res.ok)
    return (
      <ToastForServer
        type={"error"}
        title="Error Ferching Manga"
        description={res.error}
      />
    );

  const manga: FullContinueManga = res.value || {
    ...MangaFallback,
    progress: {
      chapter: "",
      page: 0,
      checkpoint: 0,
    },
  };
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
      urlPage={parsedPage}
      chapterTitle={chapterTitle}
    />
  );
}
