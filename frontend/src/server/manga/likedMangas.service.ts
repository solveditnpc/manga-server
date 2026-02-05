import { prisma } from "@/libs/prisma";

import { AsyncResult } from "@/types/server.types";
import { MangasResponse, FullManga, Manga, Server } from "@/types/manga.type";
import { User } from "@/types/auth.type";

import { DEFAULT_PAGE_SIZE } from "@/config/manga.config";
import { getMangaById } from "@/server/manga/manga.service";

// -------------------- Get Liked Reading List --------------------
export async function getLikedMangas({
  page,
  user_id,
  server,
}: {
  page: number;
  user_id: User["id"];
  server: Server;
}): AsyncResult<MangasResponse<Manga>, "INTERNAL_ERROR"> {
  try {
    const [resPrisma, total_items] = await prisma.$transaction([
      prisma.likes.findMany({
        where: { user_id, server: server },
        take: DEFAULT_PAGE_SIZE,
        skip: (page - 1) * DEFAULT_PAGE_SIZE,
        orderBy: { updated_at: "desc" },
      }),
      prisma.likes.count({
        where: { user_id, server: server },
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

    const mangas: Manga[] = resPrisma.map((contManga, i) => {
      if (!resMangas[i].ok) throw new Error("INTERNAL_ERROR");
      return resMangas[i].value;
    });

    return {
      ok: true,
      value: {
        mangas: mangas,
        total_pages: Math.ceil(total_items / DEFAULT_PAGE_SIZE),
        current_page: page,
      },
    };
  } catch (error) {
    console.log("Error `manga.service/getLikedMangas` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Delete Liked Reading --------------------
export async function deleteLikedManga({
  user_id,
  manga_id,
  server,
}: {
  user_id: User["id"];
  manga_id: Manga["manga_id"];
  server: Server;
}): AsyncResult<void, "INTERNAL_ERROR"> {
  try {
    const res = await prisma.likes.delete({
      where: {
        user_id_manga_id_server: { user_id, manga_id, server: server },
      },
    });

    if (!res) return { ok: false, error: "INTERNAL_ERROR" };

    return { ok: true, value: undefined };
  } catch (error) {
    console.log("Error `manga.service/deleteLikedManga` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Add Liked Reading --------------------
export async function addLikedManga({
  user_id,
  manga_id,
  server,
}: {
  user_id: User["id"];
  manga_id: Manga["manga_id"];
  server: Server;
}): AsyncResult<void, "INTERNAL_ERROR"> {
  try {
    const res = await prisma.likes.create({
      data: {
        user_id,
        manga_id,
        server: server,
      },
    });

    if (!res) return { ok: false, error: "INTERNAL_ERROR" };

    return { ok: true, value: undefined };
  } catch (error) {
    console.log("Error `manga.service/addLikedManga` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// -------------------- Get Liked Reading Progress --------------------
export async function getIsMangaLikedByUser({
  user_id,
  manga_id,
  server,
}: {
  user_id: User["id"];
  manga_id: Manga["manga_id"];
  server: Server;
}): AsyncResult<boolean, "INTERNAL_ERROR"> {
  try {
    const res = await prisma.likes.findUnique({
      where: {
        user_id_manga_id_server: { user_id, manga_id, server: server },
      },
    });

    if (!res) return { ok: true, value: false };

    return {
      ok: true,
      value: true,
    };
  } catch (error) {
    console.log("Error `manga.service/getIsMangaLikedByUser` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
