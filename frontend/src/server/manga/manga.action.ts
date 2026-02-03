"use server";
import { cookies } from "next/headers";

import {
  Manga,
  MangaPrams,
  MangasResponse,
  FullManga,
  ContinueManga,
  ContinueProgress,
  FullContinueManga,
  Server
} from "@/types/manga.type";
import { AsyncResult } from "@/types/server.types";

import { validateSession } from "@/server/auth/auth.service";
import {
  getMangas,
  deleteMangaService,
  addMangaService,
  getMangaById,
  updateMangaLikesCount,
} from "@/server/manga/manga.service";
import {
  getContinueMangas,
  deleteContinueManga,
  addContinueManga,
  getContinueMangaProgress,
  toContinueProgress,
} from "@/server/manga/continueManga.service";
import {
  addLikedManga,
  deleteLikedManga,
  getIsMangaLikedByUser,
  getLikedMangas,
} from "./likedMangas.service";

// ================= MANGA ACTIONS : =================
// ANCHOR Manga Actions
// -------------------- All Mangas--------------------
export async function listMangas(
  params: MangaPrams,
): AsyncResult<MangasResponse<Manga>, "INTERNAL_ERROR"> {
  return await getMangas({ ...params });
}

// -------------------- Get Manga --------------------
export async function getMangaDetails({
  id,
  server,
}: {
  id: Manga["manga_id"];
  server: Server;
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

// ===================== CONTINUE READING ACTIONS : =====================
// ANCHOR Continue Reading
// -------------------- Continue Reading List --------------------
export async function listContinueMangas({
  page,
  server,
}: {
  page: number;
  server: Server;
}): AsyncResult<MangasResponse<ContinueManga>, "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const resUser = await validateSession(session);

  if (!resUser.ok) {
    return { ok: true, value: { mangas: [], total_pages: 1, current_page: 1 } };
  }

  const user_id = resUser.value.id;
  return getContinueMangas({ user_id, page, server });
}

// -------------------- Get Reader Mnaga With Progress --------------------
export async function getReaderData({
  manga_id,
  server,
}: {
  manga_id: ContinueManga["manga_id"];
  server: Server;
}): AsyncResult<FullContinueManga, "INTERNAL_ERROR"> {
  const mangaRes = await getMangaById({ id: manga_id, server });
  if (!mangaRes.ok) return { ok: false, error: "INTERNAL_ERROR" };

  let progress: ContinueProgress = {
    chapter: "",
    page: 1,
    checkpoint: 0,
    currTotalPages: 1,
  };

  const store = await cookies();
  const session = store.get("session")?.value;
  const resUser = await validateSession(session);

  if (resUser.ok) {
    const user_id = resUser.value.id;

    const progressRes = await getContinueMangaProgress({
      user_id,
      manga_id,
      server,
    });
    console.log(progressRes);

    if (!progressRes.ok) {
      if (progressRes.error === "INTERNAL_ERROR")
        return { ok: false, error: "INTERNAL_ERROR" };
    } else {
      progress = toContinueProgress(mangaRes.value, progressRes.value);
    }
  }
  return { ok: true, value: { ...mangaRes.value, progress } };
}

// -------------------- Remove Continue Reading --------------------
export async function removeContinueManga({
  manga_id,
  server,
}: {
  manga_id: ContinueManga["manga_id"];
  server: Server;
}): AsyncResult<void, "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const resUser = await validateSession(session);

  if (!resUser.ok) {
    return { ok: false, error: "INTERNAL_ERROR" };
  }

  const user_id = resUser.value.id;

  return deleteContinueManga({ user_id, manga_id, server });
}

// -------------------- Add Continue Reading --------------------
export async function saveProgress({
  manga_id,
  progress,
  server,
}: {
  manga_id: ContinueManga["manga_id"];
  progress: ContinueProgress;
  server: Server;
}): AsyncResult<void, "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const resUser = await validateSession(session);

  if (!resUser.ok) {
    return { ok: false, error: "INTERNAL_ERROR" };
  }

  const user_id = resUser.value.id;

  return addContinueManga({ user_id, manga_id, progress, server });
}

// ===================== LIKED MANGAS ACTIONS : =====================
// ANCHOR Liked Managas
// -------------------- Continue Reading List --------------------
export async function listLikedMangas({
  page,
  server,
}: {
  page: number;
  server: Server;
}): AsyncResult<MangasResponse<Manga>, "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const resUser = await validateSession(session);

  if (!resUser.ok) {
    return { ok: true, value: { mangas: [], total_pages: 1, current_page: 1 } };
  }

  const user_id = resUser.value.id;
  return getLikedMangas({ user_id, page, server });
}

// -------------------- Toogle Like --------------------
export async function toogleLike({
  manga_id,
  server,
  liked,
}: {
  manga_id: ContinueManga["manga_id"];
  server: Server;
  liked: boolean;
}): AsyncResult<void, "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const resUser = await validateSession(session);

  if (!resUser.ok) {
    return { ok: false, error: "INTERNAL_ERROR" };
  }

  const user_id = resUser.value.id;
  let res;
  if (liked) res = await addLikedManga({ user_id, manga_id, server });
  else res = await deleteLikedManga({ user_id, manga_id, server });

  if (!res.ok) return res;

  res = await updateMangaLikesCount({ manga_id, liked, server });
  if (!res.ok) return res;

  return { ok: true, value: undefined };
}

// -------------------- Is Liked Status --------------------
export async function isMangaLiked({
  manga_id,
  server,
}: {
  manga_id: ContinueManga["manga_id"];
  server: Server;
}): AsyncResult<boolean, "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;
  const resUser = await validateSession(session);

  if (!resUser.ok) {
    return { ok: false, error: "INTERNAL_ERROR" };
  }

  const user_id = resUser.value.id;

  return getIsMangaLikedByUser({ user_id, manga_id, server });
}
