"use server";
import { Comment, AddCommentProps, CommentClient } from "@/types/comment.type";
import { AsyncResult } from "@/types/server.types";
import { Manga } from "@/types/manga.type";
import { getComments, addCommentService } from "./comment.service";
import { validateSession } from "../auth/auth.service";
import { cookies } from "next/headers";

export async function listRootComments({
  manga_id,
}: {
  manga_id: Manga["manga_id"];
}): AsyncResult<CommentClient[], "INTERNAL_ERROR"> {
  const res = await getComments({ manga_id });

  if (!res.ok) return { ok: false, error: "INTERNAL_ERROR" };

  const comments = res.value.map((cmnt) => ({
    id: cmnt.id,
    content: cmnt.content,
    created_at: cmnt.created_at,
    replies_count: cmnt.replies_count,
    username: cmnt.username,
  }));

  return {
    ok: true,
    value: comments,
  };
}

export async function listReplies({
  parent_id,
}: {
  parent_id: Comment["id"];
}): AsyncResult<CommentClient[], "INTERNAL_ERROR"> {
  return getComments({ parent_id });
}

export async function addComment(
  data: AddCommentProps,
): AsyncResult<CommentClient, "UNAUTHORIZED" | "INTERNAL_ERROR"> {
  const store = await cookies();
  const session = store.get("session")?.value;

  const res = await validateSession(session);

  if (!res.ok) {
    if (res.error === "UNAUTHORIZED") store.delete("session");
    return res;
  }

  const comment = {
    ...data,
    user_id: res.value.id,
    replies_count: 0,
    created_at: new Date(),
  };

  const resAddCmnt = await addCommentService(comment);

  if (!resAddCmnt.ok) return { ok: false, error: "INTERNAL_ERROR" };

  return {
    ok: true,
    value: {
      id: resAddCmnt.value.id,
      content: resAddCmnt.value.content,
      created_at: resAddCmnt.value.created_at,
      replies_count: resAddCmnt.value.replies_count,
      username: res.value.username,
    },
  };
}
