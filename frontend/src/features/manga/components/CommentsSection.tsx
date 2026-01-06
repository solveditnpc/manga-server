"use client";

import { Comment } from "@/types/comment.type";
import CommentItem from "./CommentItem";
import mockComments from "@/mockData/mockComments.json";
import { useState, useRef } from "react";
import { Textarea, Button } from "@/components/ui";
import Cookies from "js-cookie";

export default function CommentsSection() {
  const username = Cookies.get("username") || "unknown user";

  const [comments, setComments] = useState<Comment[]>(
    mockComments.comments || []
  );

  const [newComment, setNewComment] = useState("");

  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const roots = comments.filter((c) => c.parent_id === null);

  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_id !== null) {
      acc[c.parent_id] ??= [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {} as Record<number, Comment[]>);

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      comment_id: comments.length + 1,
      manga_id: 1,
      user_id: 1,
      username,
      content: newComment,
      created_at: new Date().toISOString(),
      parent_id: null,
    };

    // Prepend for better UX
    setComments([comment, ...comments]);
    setNewComment("");
  };
  const cancelComment = () => {
    setNewComment("");
    commentTextareaRef.current?.blur();
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-lg font-semibold fg-primary">Comments</h2>

      {/* Add comment */}
      <form
        onSubmit={addComment}
        className="
          space-y-2
          border border-default
          rounded-lg
          p-2
          bg-card
        "
      >
        <Textarea
          value={newComment}
          ref={commentTextareaRef}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment…"
          className="bg-background"
        />

        <div className="flex gap-2">
          <Button type="submit">Comment</Button>
          {newComment && (
            <button
              className="text-sm fg-muted cursor-pointer hover:text-white/80!"
              onClick={cancelComment}
              type="button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Comment list */}
      {roots.length === 0 ? (
        <p className="text-sm fg-muted">Be the first to comment.</p>
      ) : (
        <div className="space-y-6">
          {roots.map((c) => (
            <div className="space-y-3" key={c.comment_id}>
              <CommentItem
                comment={c}
                replies={repliesByParent[c.comment_id] ?? []}
                setCommnets={setComments}
              />
              <div className="border-b border-default"></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
