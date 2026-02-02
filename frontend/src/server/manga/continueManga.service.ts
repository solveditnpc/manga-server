import { prisma } from "@/libs/prisma";

import { AsyncResult } from "@/types/server.types";
import {
  MangasResponse,
  ContinueManga,
  ContinueProgress,
  ContinueReadingPrisma,
  FullManga,
} from "@/types/manga.type";
import { User } from "@/types/auth.type";

import { DEFAULT_PAGE_SIZE } from "@/config/manga.config";
import { clampCheckpoint } from "@/utils/mangas.utils";
import { getMangaById } from "@/server/manga/manga.service";

// Helpers :
export function toContinueProgress(
  manga: FullManga,
  progress: ContinueReadingPrisma,
): ContinueProgress {
  return {
    page: progress.page ?? 0,
    checkpoint: clampCheckpoint(progress.checkpoint) ?? 0,
    chapter: progress.chapter ?? "",
    currTotalPages: progress.chapter
      ? (manga.chapters.find((c) => c.title === progress.chapter)?.images
          .length ?? 0)
      : manga.total_pages,
  };
}

// -------------------- Get Continue Reading List --------------------
export async function getContinueMangas({
  page,
  user_id,
  server = "S",
}: {
  page: number;
  user_id: User["id"];
  server?: "S";
}): AsyncResult<MangasResponse<ContinueManga>, "INTERNAL_ERROR"> {
  try {
    const [resPrisma, total_items] = await prisma.$transaction([
      prisma.continueReading.findMany({
        where: { user_id, server: server ?? "N" },
        take: DEFAULT_PAGE_SIZE,
        skip: (page - 1) * DEFAULT_PAGE_SIZE,
        orderBy: { updated_at: "desc" },
      }),
      prisma.continueReading.count({
        where: { user_id, server: server ?? "N" },
      }),
    ]);

    const resMangas = await Promise.all(
      resPrisma.map((manga) =>
        getMangaById({
          id: manga.manga_id,
          server,
        }),
      ),
    );

    for (let { ok } of resMangas)
      if (!ok) return { ok: false, error: "INTERNAL_ERROR" };

    const contMangas: ContinueManga[] = resPrisma.map((contManga, i) => {
      if (!resMangas[i].ok) throw new Error("INTERNAL_ERROR");

      const manga = resMangas[i].value;

      return {
        ...manga,
        progress: toContinueProgress(manga, contManga),
      };
    });

    return {
      ok: true,
      value: {
        mangas: contMangas,
        total_pages: Math.ceil(total_items / DEFAULT_PAGE_SIZE),
        current_page: page,
      },
    };
  } catch (error) {
    console.log("Error `manga.service/getContinueMangas` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Delete Continue Reading --------------------
export async function deleteContinueManga({
  user_id,
  manga_id,
  server = "S",
}: {
  user_id: User["id"];
  manga_id: ContinueManga["manga_id"];
  server?: "S";
}): AsyncResult<void, "INTERNAL_ERROR"> {
  try {
    const res = await prisma.continueReading.delete({
      where: {
        user_id_manga_id_server: { user_id, manga_id, server: server ?? "N" },
      },
    });

    if (!res) return { ok: false, error: "INTERNAL_ERROR" };

    return { ok: true, value: undefined };
  } catch (error) {
    console.log("Error `manga.service/deleteContinueManga` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Add Continue Reading --------------------
export async function addContinueManga({
  user_id,
  manga_id,
  progress,
  server,
}: {
  user_id: User["id"];
  manga_id: ContinueManga["manga_id"];
  progress: ContinueProgress;
  server?: "S";
}): AsyncResult<void, "INTERNAL_ERROR"> {
  try {
    const res = await prisma.continueReading.upsert({
      where: {
        user_id_manga_id_server: { user_id, manga_id, server: server ?? "N" },
      },
      create: {
        user_id,
        manga_id,
        chapter: progress.chapter,
        page: progress.page,
        checkpoint: progress.checkpoint,
        server: server ?? "N",
      },
      update: {
        chapter: progress.chapter,
        page: progress.page,
        checkpoint: progress.checkpoint,
      },
    });

    if (!res) return { ok: false, error: "INTERNAL_ERROR" };

    return { ok: true, value: undefined };
  } catch (error) {
    console.log("Error `manga.service/addContinueManga` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Get Continue Reading Progress --------------------
export async function getContinueMangaProgress({
  user_id,
  manga_id,
  server,
}: {
  user_id: User["id"];
  manga_id: ContinueManga["manga_id"];
  server?: "S";
}): AsyncResult<ContinueReadingPrisma, "INTERNAL_ERROR" | "NOT_FOUND"> {
  try {
    const res = await prisma.continueReading.findUnique({
      where: {
        user_id_manga_id_server: { user_id, manga_id, server: server ?? "N" },
      },
    });

    if (!res) return { ok: false, error: "NOT_FOUND" };

    return {
      ok: true,
      value: res,
    };
  } catch (error) {
    console.log("Error `manga.service/getContinueMangaProgress` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
