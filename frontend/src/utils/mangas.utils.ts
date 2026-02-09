import { MangaFallback as _FB } from "@/config/manga.config";
import { toValidUrl } from "./params.utils";
import { Manga, FullManga, Chapter, Server } from "@/types/manga.type";

export function parseManga({
  manga: m,
  server,
  full = false,
}: {
  manga: any;
  server: Server;
  full?: boolean;
}): FullManga | Manga {
  const manga_id = Number(m.manga_id ?? _FB.manga_id);

  const title = m?.title ?? _FB.title;
  const author = m?.author ?? _FB.author;
  const like_count = m?.like_count ?? _FB.like_count;
  const total_pages = m?.total_pages ?? _FB.total_pages;
  const download_timestamp = m?.download_timestamp ?? _FB.download_timestamp;

  const tags =
    typeof m?.tags === "string" ? JSON.parse(m?.tags ?? "[]") : (m?.tags ?? []);

  const language = (
    m?.language
      ? m.language
      : (tags.find((t: any) => t?.type === "languages")?.name ?? _FB.language)
  ).toUpperCase();

  const download_path = toValidUrl(m?.download_path ?? "");

  // Hack for supporting suwayomi fallback
  const cover_base =
    server === "S" && m.cover_image.startsWith("suwayomi_data")
      ? "/"
      : m.download_path;
  console.log(m.cover_image, ", ", cover_base);
  const cover_image = toValidUrl(m?.cover_image, cover_base);

  const res: Manga = {
    manga_id,
    title,
    author,
    cover_image,
    language,
    like_count,
    total_pages,
    download_timestamp,
    download_path,
    tags,
  };

  if (!full) return res as Manga;

  const page_files = m?.page_files.map((p: string) =>
    toValidUrl(p, m.download_path),
  );
  const chapters =
    m?.chapters.map((ch: Chapter) => {
      const images = ch.images.map(
        (i) => `${toValidUrl(ch.title, m.download_path)}${toValidUrl(i)}`,
      );
      return { ...ch, images };
    }) ?? [];

  return { ...res, page_files, chapters } as FullManga;
}

export function isServerValid(server: string | undefined): boolean {
  return ["N", "S"].includes(server ?? "");
}

export function toValidServer(server: string | undefined): Server {
  const isN = ["n", "N"].includes(server ?? "");
  if (!isN) return "S";
  return "N";
}
