"use client";
import { useEffect, useState, useRef } from "react";
import { useCurrentUser } from "@/hooks/auth.hooks";
import { Comment } from "@/types/comment.type";
import CommentForm from "./CommentForm";
import { Dropdown } from "@/components/ui";
import { getMangaRepliesById, addComment } from "@/client/comments.client";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const { data: user } = useCurrentUser();
  const repliesCount = useRef<number>(comment.repliesCount || 0);
  const lastFetchedAt = useRef<Date | null>(null);

  const fetchReplies = async () => {
    try {
      setLoadingReplies(true);

      const fetchedReplies = await getMangaRepliesById(comment.comment_id);

      setReplies(fetchedReplies);
      repliesCount.current = fetchedReplies.length;
      lastFetchedAt.current = new Date();
    } catch (error) {
      toast.error("Failed to load replies");
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (!showReplies) return;

    const MIN_TIME_GAP = 30000; // 30 seconds

    if (
      lastFetchedAt.current &&
      Date.now() - lastFetchedAt.current.getTime() < MIN_TIME_GAP
    )
      return;

    fetchReplies();
  }, [comment.comment_id, showReplies]);

  const addReply = async (newReply: string) => {
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

    try {
      // Optimistic UI
      setReplies((prev) => [reply, ...prev]);
      repliesCount.current += 1;

      await addComment(reply);
    } catch (error) {
      setReplies((prev) =>
        prev.filter((r) => r.comment_id !== reply.comment_id),
      );
      repliesCount.current -= 1;
      toast.error("Failed to add reply");
    }
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
        {repliesCount.current > 0 && (
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
              : `View ${repliesCount.current} repl${repliesCount.current > 1 ? "ies" : "y"}`}
          </button>
        )}
      </div>

      {/* Replies */}
      {showReplies && repliesCount.current > 0 && (
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
      {loadingReplies && (
        <div className="w-full flex items-center justify-center">
          <Loader className="animate-spin stroke-muted" size={12} />{" "}
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
