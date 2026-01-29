"use server";
import {
  Manga,
  MangaPrams,
  MangasResponse,
  FullManga,
} from "@/types/manga.type";
import { AsyncResult } from "@/types/server.types";
import {
  getMangas,
  deleteMangaService,
  addMangaService,
  getMangaById,
} from "./manga.service";
import { cookies } from "next/headers";
import { validateSession } from "../auth/auth.service";

// -------------------- All Mangas--------------------
export async function listMangas(
  params: MangaPrams,
): AsyncResult<MangasResponse, "INTERNAL_ERROR"> {
  return await getMangas({ ...params });
}

// -------------------- Get Manga --------------------
export async function getMangaDetails({
  id,
  server,
}: {
  id: Manga["manga_id"];
  server?: "S";
}): AsyncResult<FullManga, "INTERNAL_ERROR"> {
  return await getMangaById({ id, server });
}

// -------------------- Delete Manga --------------------
export async function deleteManga(
  id: number,
): AsyncResult<void, "UNAUTHORIZED" | "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const res = await validateSession(session);

  if (!res.ok) {
    if (res.error === "UNAUTHORIZED") store.delete("session");
    return res;
  }

  if (res.value.role !== "ADMIN") return { ok: false, error: "UNAUTHORIZED" };

  return await deleteMangaService(id);
}

// -------------------- Add Manga --------------------
export async function addManga(
  query: string,
): AsyncResult<
  void,
  | { type: "INVALID_INPUT" }
  | { type: "INTERNAL_ERROR" }
  | { type: "PARTIAL_FAILURE"; failed: number }
  | { type: "UNAUTHORIZED" }
> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const res = await validateSession(session);

  if (!res.ok) {
    if (res.error === "UNAUTHORIZED") store.delete("session");
    return { ok: false, error: { type: res.error } };
  }

  if (res.value.role !== "ADMIN")
    return { ok: false, error: { type: "UNAUTHORIZED" } };

  if (!query) return { ok: false, error: { type: "INVALID_INPUT" } };

  const isOnlyIds = /^[0-9\s,]+$/.test(query);

  if (isOnlyIds) {
    const mangaIds = query
      .split(" ")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (mangaIds.length === 0)
      return { ok: false, error: { type: "INVALID_INPUT" } };

    const res = await Promise.all(
      mangaIds.map((id) => addMangaService({ manga_id: id })),
    );
    const failed = res.filter((r) => !r.ok).length;
    if (failed > 0) {
      if (failed < mangaIds.length)
        return { ok: false, error: { type: "PARTIAL_FAILURE", failed } };

      return { ok: false, error: { type: "INTERNAL_ERROR" } };
    }
    return { ok: true, value: undefined };
  } else {
    return addMangaService({ author: query });
  }
}
