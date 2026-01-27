import { User } from "./auth.type";

export interface Comment {
  comment_id: number;
  manga_id: number;

  user_id: User["id"];
  username: string;

  content: string;
  created_at: string;

  parent_id: number | null;
  repliesCount: number | null;
}

