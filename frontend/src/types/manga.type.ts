import { Server } from "@/generated/prisma/enums";

export type { ContinueReading as ContinueReadingPrisma } from "@/generated/prisma/client";
export type { Server };

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

export type ContinueProgress = {
  chapter: string;
  page: number;
  checkpoint: 0 | 0.25 | 0.5 | 0.75 | 1;
  currTotalPages: number;
};

export interface Chapter {
  title: string;
  images: string[];
}
export type Sort = "date" | "likes";
export type MangaPrams = {
  page: number;
  query: string;
  sort: Sort;
  server: Server;
};

export interface ContinueManga extends Manga {
  progress: ContinueProgress | null;
}

export interface FullManga extends Manga {
  page_files: string[];
  chapters: Chapter[];
}

export interface FullContinueManga extends FullManga {
  progress: ContinueProgress | null;
}

export interface MangasResponse<_MangaType_> {
  mangas: _MangaType_[];
  total_pages: number;
  current_page: number;
}
