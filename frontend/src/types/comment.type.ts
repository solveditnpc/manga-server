import { User } from "./auth.type";
import { Server } from "./manga.type";
import { Comment as CommentPrisma } from "@/generated/prisma/client";

export type { CommentPrisma };

export interface Comment extends Omit<CommentPrisma, "parent_id" | "server"> {
  username: User["username"];
  parent_id: CommentPrisma["id"] | null;
}

export type AddCommentProps = {
  manga_id: Comment["manga_id"];
  parent_id: Comment["id"] | null;
  content: Comment["content"];
  server: Server;
};

export type CommentClient = {
  id: Comment["id"];
  username: Comment["username"];
  content: Comment["content"];
  created_at: Comment["created_at"];
  replies_count: Comment["replies_count"] | null;
};
