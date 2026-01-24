import { Manga } from "@/types/manga.type";

import { MangaFallback } from "@/config/manga.config";
import { getMangaById, getMangaPagesById } from "@/client/mangas.client";
import Reader from "@/components/domain/read/Reader";
import { clampPage } from "@/utils/pagination.utils";

export default async function MangaReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page: string }>;
}) {
  const { id } = await params;
  const { page } = await searchParams;

  const manga: Manga = (await getMangaById(Number(id))) || MangaFallback;
  const parsedPage = clampPage(page, manga.total_pages, 1);

  const pages = await getMangaPagesById(manga.manga_id);

  return <Reader pages={pages} manga={manga} initialPage={parsedPage} />;
}
