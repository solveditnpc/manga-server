import { ContinueProgress } from "@/types/manga.type";
import { MangaFallback } from "@/config/manga.config";
import { toValidUrl } from "./params.utils";
import { Manga, FullManga , Chapter } from "@/types/manga.type";

export function clampCheckpoint(
  checkpoint: unknown,
): ContinueProgress["checkpoint"] {
  const numCheckPnt = Number(checkpoint);
  if (numCheckPnt > 1) return 1;
  if (numCheckPnt > 0.75) return 0.75;
  if (numCheckPnt > 0.5) return 0.5;
  if (numCheckPnt > 0.25) return 0.25;
  return 0;
}


export function parseManga({
  manga,
  server,
  full = false,
}: {
  manga: any;
  server: "S" | undefined;
  full?: boolean;
}): FullManga | Manga {
  const download_path = toValidUrl(manga?.download_path ?? "") ?? "/";

  const base_path = server === "S" ? `/` : `${manga.download_path}/`;
  const res: Manga = {
    manga_id: Number(manga?.manga_id ?? MangaFallback.manga_id),
    title: manga?.title ?? MangaFallback.title,
    author: manga?.author ?? MangaFallback.author,
    cover_image: manga?.cover_image ? `${base_path}${manga?.cover_image}` : "",
    language: manga?.language ?? MangaFallback.language,
    like_count: manga?.like_count ?? MangaFallback.like_count,
    tags: JSON.parse(manga?.tags ?? "[]") ?? [],
    total_pages: manga?.total_pages ?? MangaFallback.total_pages,
    download_timestamp:
      manga?.download_timestamp ?? MangaFallback.download_timestamp,
    download_path: download_path,
  };

  if (full)
    return {
      ...res,
      page_files:
        manga?.page_files.map((page: string) => `${base_path}${page}`) ?? [],
      chapters:
        manga?.chapters.map((chapter: Chapter) => {
          const parsedTitle = toValidUrl(chapter?.title ?? "") ?? "";
          return {
            ...chapter,
            images: chapter.images.map(
              (image: string) => `${download_path}/${parsedTitle}/${image}`,
            ),
          };
        }) ?? [],
    } as FullManga;

  return res as Manga;
}
