import { AsyncResult } from "@/types/server.types";
import {
  MangasResponse,
  MangaPrams,
  Manga,
  FullManga,
  Server,
} from "@/types/manga.type";
import { toSearchParamsString } from "@/utils/params.utils";
import { parseManga } from "@/utils/mangas.utils";

const API_URL = process.env.API_URL;

// -------------------- Get Mangas--------------------

export async function getMangas(
  params: MangaPrams,
): AsyncResult<MangasResponse<Manga>, "INTERNAL_ERROR"> {
  try {
    const searchParams = toSearchParamsString({
      page: params.page,
      q: params.query,
      sort: params.sort,
      server: params.server === "S" ? params.server : "",
    });
    const res = await fetch(`${API_URL}/mangas?${searchParams}`);

    if (!res.ok) return { ok: false, error: "INTERNAL_ERROR" };
    const json = await res.json();

    const mangas: Manga[] = json?.mangas.map((manga: any) =>
      parseManga({ manga, server: params.server }),
    );

    const result: MangasResponse<Manga> = {
      total_pages: json.total_pages,
      current_page: json.current_page,
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
  server: Server;
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

// -------------------- Update Mnage Likes Count --------------------
export async function updateMangaLikesCount({
  manga_id,
  liked,
  server,
}: {
  manga_id: Manga["manga_id"];
  liked: boolean;
  server: Server;
}): AsyncResult<void, "INTERNAL_ERROR"> {
  try {
    const res = await fetch(
      `${API_URL}/${server === "S" ? "s_" : ""}mangas/${manga_id}/${liked ? "like" : "unlike"}`,
      {
        method: "POST",
      },
    );
    if (!res.ok) return { ok: false, error: "INTERNAL_ERROR" };

    return { ok: true, value: undefined };
  } catch (error) {
    console.log("Error `manga.service/updateMangaLikesCount` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
