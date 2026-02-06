import { FullContinueManga } from "@/types/manga.type";
import { MangaFallback } from "@/config/manga.config";
import Reader from "@/components/domain/read/Reader";
import ToastForServer from "@/components/domain/server/ToastForServer";

import { getMangaDetailsWithProgress } from "@/server/manga/manga.action";
import { Server } from "@/types/manga.type";

export default async function MangaChapteredReadPage({
  params,
}: {
  params: Promise<{ id: string; server: Server; chapter: string }>;
}) {
  const { id, server, chapter:chParam } = await params;
  const chapter = decodeURIComponent(chParam);
  
  const res = await getMangaDetailsWithProgress({ manga_id: Number(id), server });

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
  const ch = res.value.chapters.filter((ch) => ch.title === chapter)[0];
  const pages = ch.images;
  const chapterTitle = ch.title;

  return <Reader pages={pages} manga={manga} chapterTitle={chapterTitle} />;
}
