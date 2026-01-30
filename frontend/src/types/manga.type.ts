export interface MangaTag {
  type: string; // e.g. "genre", "theme", "languages"
  name: string; // e.g. "romance", "school", "english"
}

export interface Manga {
  manga_id: number;

  title: string;
  author: string;

  cover_image: string; // relative path or URL
  download_path?: string; // used to build image URLs (backend-style)

  tags?: MangaTag[];
  total_pages: number;
  language?: string; // derived (e.g. "EN", "JP")

  like_count: number;
  score?: number;
  download_timestamp: Date | string;
}

export interface ContinueManga extends Manga {
  href: string;
}

export type Sort = "date" | "likes";

export type MangaPrams = {
  page: number;
  query: string;
  sort: Sort;
  server?: "S";
};

export interface Chapter {
  title: string;
  images: string[];
}

export interface FullManga extends Manga {
  page_files: string[];
  chapters: Chapter[];
}

export interface FullMangasResponse {
  mangas: FullManga[];
  total_pages: number;
  total_results: number;
  current_page: number;
  total_items: number;
}

export type MangasResponse = {
  mangas: Manga[];
  total_pages: number;
  total_results: number;
  current_page: number;
  total_items: number;
};
