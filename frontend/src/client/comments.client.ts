import mockComments from "@/_mock/mockComments.json";
import { Comment } from "@/types/comment.type";
import { Manga } from "@/types/manga.type";
import { delay } from "@/_mock/mockPromise";
import { compareByDate } from "@/utils/sorting.utils";

const ALL_COMMENTS: Comment[] = mockComments.comments;

export async function getMangaRootCommentsById(
  id: Manga["manga_id"],
): Promise<Comment[]> {
  await delay(500);
  return ALL_COMMENTS.filter((c) => c.parent_id == null).sort(
    compareByDate((c) => c.created_at),
  );
}

export async function getMangaRepliesById(
  id: Comment["comment_id"],
): Promise<Comment[]> {
  await delay(500);
  return ALL_COMMENTS.filter((c) => c.parent_id === id).sort(
    compareByDate((c) => c.created_at),
  );
}

export async function getMangaRepliesCountById(
  id: Comment["comment_id"],
): Promise<number> {
  await delay(500);
  return ALL_COMMENTS.filter((c) => c.parent_id === id).length;
}

export async function addComment(comment: Comment) {
  await delay(500);
  ALL_COMMENTS.push(comment);
}
