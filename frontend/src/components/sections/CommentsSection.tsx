"use client";
import { useState, useRef } from "react";
import { useCurrentUser } from "@/hooks/auth.hooks";

import { CommentClient } from "@/types/comment.type";
import { Manga } from "@/types/manga.type";

import CommentItem from "@/components/domain/comment/CommentItem";
import CommentForm from "@/components/domain/comment/CommentForm";

import { addComment } from "@/server/comment/comment.actions";
import { toast } from "sonner";

interface CommentSectionProps {
  rootComments: CommentClient[];
  manga_id: Manga["manga_id"];
}

export default function CommentsSection({
  rootComments,
  manga_id,
}: CommentSectionProps) {
  const { data: user } = useCurrentUser();

  const [comments, setComments] = useState<CommentClient[]>(rootComments);
  const commentsCount = useRef<number>(rootComments.length);

  const handleAddComment = async (newComment: string) => {
    if (!newComment.trim() || !user?.id || !user?.username) return;
    
    const comment: CommentClient = {
      id: Date.now(),
      username: user.username,
      content: newComment,
      created_at: new Date(),
      replies_count: 0,
    };

    try {
      // Optimistic UI
      setComments((prev) => [comment, ...prev]);
      commentsCount.current += 1;
      
      const res = await addComment({
        manga_id: manga_id,
        content: newComment,
        parent_id: null,
      });

      if (!res.ok) {
        toast.error("Failed to add comment");
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
        commentsCount.current -= 1;
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? res.value : c)),
        );
      }
    } catch (error) {
      toast.error("Failed to add comment");
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
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
            <CommentItem key={c.id} comment={c} manga_id={manga_id} />
          ))}
        </div>
      )}
    </section>
  );
}
