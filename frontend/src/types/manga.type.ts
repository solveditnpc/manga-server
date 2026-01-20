export interface MangaTag {
  type: string; // e.g. "genre", "theme", "languages"
  name: string; // e.g. "romance", "school", "english"
}

export interface Manga {
  manga_id: number;

  title: string;
  author?: string;

  cover_url: string; // relative path or URL
  download_path?: string; // used to build image URLs (backend-style)

  tags?: MangaTag[];
  total_pages: number;
  language?: string; // derived (e.g. "EN", "JP")

  likes_count: number;
  created_date: Date | string;
}

export type MangaList = Manga[];

export type Sort = "date" | "likes";