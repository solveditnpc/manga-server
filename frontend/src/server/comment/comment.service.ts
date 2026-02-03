import { Comment, AddCommentProps, CommentPrisma } from "@/types/comment.type";
import { AsyncResult } from "@/types/server.types";
import { Manga, Server } from "@/types/manga.type";
import { prisma } from "@/libs/prisma";

type getCommentsParams =
  | { manga_id: Manga["manga_id"]; server: Server }
  | { parent_id?: Comment["id"] };

export async function getComments(
  query: getCommentsParams,
): AsyncResult<Comment[], "INTERNAL_ERROR"> {
  try {
    const where =
      "manga_id" in query
        ? { manga_id: query.manga_id, parent_id: null, server: query.server }
        : { parent_id: query.parent_id };

    const res = await prisma.comment.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: { created_at: "desc" },
    });

    return {
      ok: true,
      value: res.map((cmnt) => ({
        id: cmnt.id,
        manga_id: cmnt.manga_id,
        content: cmnt.content,
        username: cmnt.user.username,
        created_at: cmnt.created_at,
        replies_count: cmnt.replies_count,
        parent_id: cmnt.parent_id,
        user_id: cmnt.user_id,
      })),
    };
  } catch (error) {
    console.log("Error `comment.service/getCommentsByMangaId` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function addCommentService(
  data: Omit<CommentPrisma, "id">,
): AsyncResult<CommentPrisma, "INTERNAL_ERROR"> {
  try {
    const res = await prisma.$transaction(async (tx) => {
      const resAdd = await tx.comment.create({ data });

      if (data.parent_id !== null) {
        await tx.comment.update({
          where: { id: data.parent_id },
          data: { replies_count: { increment: 1 } },
        });
      }
      return resAdd;
    });
    return { ok: true, value: res };
  } catch (error) {
    console.log("Error `comment.service/addComment` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
