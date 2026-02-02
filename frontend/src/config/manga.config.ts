import { Manga , FullManga } from "@/types/manga.type";

export const MangaFallback: FullManga = {
  manga_id: -1,
  title: "Manga Not Found (404)",
  author: "Unknown Author",
  cover_image: "",
  tags: [],
  total_pages: 1,
  like_count: 0,
  language: "N/A",
  download_timestamp: new Date(),
  chapters: [],
  page_files: [],
};

export const DEFAULT_PAGE_SIZE = 24;