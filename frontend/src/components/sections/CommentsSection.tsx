"use client";
import { useState, useRef } from "react";
import { useCurrentUser } from "@/hooks/auth.hooks";
import { Comment } from "@/types/comment.type";
import { Manga } from "@/types/manga.type";
import CommentItem from "@/components/domain/comment/CommentItem";
import CommentForm from "../domain/comment/CommentForm";
import { addComment } from "@/client/comments.client";
import { toast } from "sonner";

interface CommentSectionProps {
  rootComments: Comment[];
  manga_id: Manga["manga_id"];
}

export default function CommentsSection({
  rootComments,
  manga_id,
}: CommentSectionProps) {
  const { data: user } = useCurrentUser();

  const [comments, setComments] = useState<Comment[]>(rootComments);
  const commentsCount = useRef<number>(rootComments.length);

  const handleAddComment = async (newComment: string) => {
    if (!newComment.trim() || !user?.id || !user?.username) return;

    const comment: Comment = {
      comment_id: Date.now(),
      manga_id: manga_id,
      user_id: user.id,
      username: user.username,
      content: newComment,
      created_at: new Date().toISOString(),
      parent_id: null,
      repliesCount: 0,
    };

    // fetch Call Here
    try {
      // Optimistic UI
      setComments((prev) => [comment, ...prev]);
      commentsCount.current += 1;

      await addComment(comment);
    } catch (error) {
      toast.error("Failed to add comment");
      setComments((prev) =>
        prev.filter((c) => c.comment_id !== comment.comment_id),
      );
      commentsCount.current -= 1;
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-lg font-semibold fg-primary flex items-center gap-1">
        Comments
        <span className="text-sm fg-muted"> ({commentsCount.current})</span>
      </h2>

      {/* Add comment */}
      <div
        className="
          space-y-2
          border border-default
          rounded-lg
          p-2
          bg-card
        "
      >
        <CommentForm onSubmit={handleAddComment} buttonLabel="Comment" />
      </div>
      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm fg-muted">Be the first to comment.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem key={c.comment_id} comment={c} />
          ))}
        </div>
      )}
    </section>
  );
}
