"use client";

import { Comment } from "@/types/comment.type";
import { useEffect, useRef, useState } from "react";
import { Textarea, Button } from "@/components/ui";
import Cookies from "js-cookie";

interface Props {
  comment: Comment;
  replies: Comment[];
  setCommnets: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export default function CommentItem({ comment, replies, setCommnets }: Props) {
  const username = Cookies.get("username") || "unknown user";

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReply, setNewReply] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Focus textarea when reply opens */
  useEffect(() => {
    if (showReplyForm) {
      textareaRef.current?.focus();
    } else {
      setNewReply("");
    }
  }, [showReplyForm]);

  const addReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setCommnets((comments) => [
      ...comments,
      {
        comment_id: comments.length + 1,
        manga_id: comment.manga_id,
        user_id: 1,
        username,
        content: newReply,
        created_at: new Date().toISOString(),
        parent_id: comment.comment_id,
      },
    ]);

    setShowReplyForm(false);
  };

  /* Escape + click-outside handling */
  useEffect(() => {
    if (!showReplyForm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowReplyForm(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        formRef.current &&
        !formRef.current.contains(e.target as Node) &&
        !newReply.trim()
      ) {
        setShowReplyForm(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReplyForm, newReply]);

  return (
    <div className="space-y-3">
      {/* Main comment */}
      <div className="space-y-1">
        <div className="text-sm fg-secondary flex items-center gap-2">
          <span className="font-medium fg-primary">{comment.username}</span>
          <span className="text-xs fg-muted">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="text-sm fg-primary leading-relaxed">{comment.content}</p>

        <button
          onClick={() => setShowReplyForm((v) => !v)}
          className="text-xs fg-muted hover:fg-primary focus-ring"
        >
          Reply
        </button>
      </div>

      {/* Replies + reply form */}
      <div className="ml-5 border-l border-default pl-3 space-y-3">
        {showReplyForm && (
          <form ref={formRef} onSubmit={addReply}>
            <Textarea
              ref={textareaRef}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder={`Reply to ${comment.username}…`}
            />

            <div className="flex gap-2 mt-2">
              <Button type="submit" >
                Reply
              </Button>

              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="text-xs fg-muted hover:fg-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {replies.map((r) => (
          <div key={r.comment_id} className="space-y-1">
            <div className="text-xs fg-secondary flex items-center gap-2">
              <span className="font-medium fg-primary">{r.username}</span>
              <span className="fg-muted">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm fg-primary leading-relaxed">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
