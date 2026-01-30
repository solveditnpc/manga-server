import { AsyncResult } from "@/types/server.types";
import {
  MangasResponse,
  MangaPrams,
  Manga,
  FullManga,
  Chapter,
} from "@/types/manga.type";
import { toSearchParamsString, toValidUrl } from "@/utils/params.utils";
import { MangaFallback } from "@/config/manga.config";

export const DEFAULT_PAGE_SIZE: number = 24;

const API_URL = process.env.API_URL;

function parseManga({
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
    manga_id: manga?.manga_id ?? MangaFallback.manga_id,
    title: manga?.title ?? MangaFallback.title,
    author: manga?.author ?? MangaFallback.author,
    cover_image: manga?.cover_image ? `${base_path}${manga?.cover_image}` : "",
    language: manga?.language ?? MangaFallback.language,
    like_count: manga?.like_count ?? MangaFallback.like_count,
    tags: JSON.parse(manga?.tags ?? "[]"),
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

// -------------------- Get Mangas--------------------

export async function getMangas(
  params: MangaPrams,
): AsyncResult<MangasResponse, "INTERNAL_ERROR"> {
  try {
    const searchParams = toSearchParamsString({
      page: params.page,
      q: params.query,
      sort: params.sort,
      server: params?.server,
    });
    const res = await fetch(`${API_URL}/mangas?${searchParams}`);

    if (!res.ok) return { ok: false, error: "INTERNAL_ERROR" };
    const json = await res.json();

    const mangas: Manga[] = json?.mangas.map((manga: any) =>
      parseManga({ manga, server: params.server }),
    );

    const result: MangasResponse = {
      total_pages: json.total_pages,
      total_results: json.total_results,
      current_page: json.current_page,
      total_items: json.total_items,
      mangas: mangas,
    };
    return {
      ok: true,
      value: result,
    };
  } catch (error) {
    console.log("Error `manga.service/getMangas` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Get Manga By Id --------------------
export async function getMangaById({
  id,
  server,
}: {
  id: Manga["manga_id"];
  server?: "S";
}): AsyncResult<FullManga, "INTERNAL_ERROR"> {
  try {
    const searchParams = toSearchParamsString({
      page: 1,
      q: id.toString(),
      sort: "date",
      server: server,
    });
    const res = await fetch(`${API_URL}/mangas?${searchParams}`);

    if (!res.ok) return { ok: false, error: "INTERNAL_ERROR" };

    const json = await res.json();

    const manga: FullManga = parseManga({
      manga: json?.mangas[0],
      full: true,
      server: server,
    }) as FullManga;

    return {
      ok: true,
      value: manga,
    };
  } catch (error) {
    console.log("Error `manga.service/getMangas` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Delete Manga --------------------
export async function deleteMangaService(
  manga_id: number,
): AsyncResult<void, "INTERNAL_ERROR"> {
  try {
    const res = await fetch(`${API_URL}/mangas/${manga_id}`, {
      method: "DELETE",
    });

    if (!res.ok) return { ok: false, error: "INTERNAL_ERROR" };

    return { ok: true, value: undefined };
  } catch (error) {
    console.log("Error `manga.service/deleteManga` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Add Manga --------------------
export async function addMangaService(
  payload: { author: string } | { manga_id: number },
): AsyncResult<void, { type: "INTERNAL_ERROR" }> {
  try {
    console.log(payload);

    const res = await fetch(`${API_URL}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, error: { type: "INTERNAL_ERROR" } };

    return { ok: true, value: undefined };
  } catch (error) {
    console.log("Error `manga.service/addManga` : \n", error);
    return { ok: false, error: { type: "INTERNAL_ERROR" } };
  }
}
