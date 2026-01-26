export interface Comment {
  comment_id: number;
  manga_id: number;

  user_id: string;
  username: string;

  content: string;
  created_at: string;

  parent_id: number | null;
  repliesCount: number | null;
}

