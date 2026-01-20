import { Manga } from "@/types/manga.type";

export const MangaFallback:Manga = {
  manga_id : -1,
  title : "Manga Not Found (404)",
  author : "Unknown Author",
  cover_url : "",
  tags : [],
  total_pages : 1,
  likes_count : 0,
  language: "N/A",
  created_date: new Date() 
};