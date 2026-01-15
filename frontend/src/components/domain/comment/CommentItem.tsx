"use client";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/auth.hooks";
import { Comment } from "@/types/comment.type";
import CommentForm from "./CommentForm";
import { Dropdown } from "@/components/ui";
import mockComments from "@/_mock/mockComments.json";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount || 0);
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (!showReplies || replies.length > 0) return;
    // fetch Call Here
    const fetchedReplies = mockComments.comments.filter(
      (c) => c.parent_id === comment.comment_id
    );
    setReplies(fetchedReplies);
  }, [comment.comment_id, showReplies]);

  const addReply = (newReply: string) => {
    if (!newReply.trim() || !user?.id || !user?.username) return;

    const reply: Comment = {
      comment_id: Date.now(),
      manga_id: comment.manga_id,
      user_id: user.id,
      username: user.username,
      content: newReply.trim(),
      created_at: new Date().toISOString(),
      parent_id: comment.comment_id,
      repliesCount: null,
    };

    // fetch Call Here
    setRepliesCount((prev) => prev + 1);
    setReplies((prev) => [reply, ...prev]);
  };

  return (
    <div
      className={`space-y-2 pb-3 border-b ${
        !showReplies ? "border-default" : " border-mid"
      }`}
    >
      {/* Main comment */}
      <div className="space-y-1">
        <div className="text-sm fg-secondary flex items-center gap-2">
          <span className="font-medium text-xs fg-primary">
            {comment.username}
          </span>
          <span className="text-xs fg-muted">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="text-sm fg-primary leading-relaxed">{comment.content}</p>

        <AddReply onAddReply={addReply} />
        {repliesCount > 0 && (
          <button
            type="button"
            onClick={() => setShowReplies((v) => !v)}
            className="
              fg-muted text-xs 
              focus-ring cursor-pointer
              w-full
              hover:fg-primary
            "
          >
            {showReplies
              ? "Hide replies"
              : `View ${repliesCount} repl${repliesCount > 1 ? "ies" : "y"}`}
          </button>
        )}
      </div>

      {/* Replies */}
      {showReplies && repliesCount > 0 && (
        <div className="ml-3 space-y-3">
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
      )}
    </div>
  );
}

function AddReply({ onAddReply }: { onAddReply: (reply: string) => void }) {
  const [open, setOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);

  const onOpenChange = (e: boolean) => {
    if (e) setOpen(e);
    else if (!isFormDirty) setOpen(e);
  };

  return (
    <Dropdown
      fixedAlign="left"
      trigger={
        <p className="text-xs fg-muted hover:fg-primary focus-ring">Reply</p>
      }
      open={open}
      onOpenChange={onOpenChange}
      menuClassName="w-full"
    >
      <div className="w-full">
        <CommentForm
          onSubmit={onAddReply}
          onCancel={() => setOpen(false)}
          buttonLabel="Reply"
          autoFocus
          onDirtyChange={setIsFormDirty}
        />
      </div>
    </Dropdown>
  );
}
