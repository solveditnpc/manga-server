export interface Comment {
  comment_id: number;
  manga_id: number;

  user_id: number;
  username: string;

  content: string;
  created_at: string;

  parent_id: number | null;
}

