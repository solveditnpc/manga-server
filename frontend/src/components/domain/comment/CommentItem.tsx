"use client";
import { useEffect, useState, useRef } from "react";
import { useCurrentUser } from "@/hooks/auth.hooks";
import { CommentClient, Comment } from "@/types/comment.type";
import CommentForm from "./CommentForm";
import { Dropdown } from "@/components/ui";
import { addComment } from "@/server/comment/comment.actions";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { listReplies } from "@/server/comment/comment.actions";
import { Manga } from "@/types/manga.type";
import { useServerContext } from "../server/ServerContext";

interface CommentItemProps {
  comment: CommentClient;
  manga_id: Manga["manga_id"];
}

export default function CommentItem({ comment, manga_id }: CommentItemProps) {
  const [replies, setReplies] = useState<CommentClient[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { server } = useServerContext();
  const { data: user } = useCurrentUser();
  const replies_count = useRef<number>(comment.replies_count || 0);
  const lastFetchedAt = useRef<Date | null>(null);

  const fetchReplies = async () => {
    try {
      setLoadingReplies(true);

      const repliesRes = await listReplies({ parent_id: comment.id });
      if (!repliesRes.ok)
        toast.error("Failed to load replies", {
          description: repliesRes.error,
        });
      else {
        setReplies(repliesRes.value);
        replies_count.current = repliesRes.value.length;
        lastFetchedAt.current = new Date();
      }
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
  }, [comment.id, showReplies]);

  const addReply = async (newReply: string) => {
    const trimmedReply = newReply.trim();
    if (!trimmedReply || !user?.id || !user?.username) return;

    const reply: CommentClient = {
      id: Date.now(),
      username: user.username,
      content: newReply.trim(),
      created_at: new Date(),
      replies_count: 0,
    };
    try {
      // Optimistic UI
      setReplies((prev) => [reply, ...prev]);
      replies_count.current += 1;

      const res = await addComment({
        manga_id: manga_id,
        parent_id: comment.id,
        content: newReply.trim(),
        server,
      });

      if (!res.ok) {
        toast.error("Failed to add comment");
        setReplies((prev) => prev.filter((c) => c.id !== comment.id));
        replies_count.current -= 1;
      } else {
        setReplies((prev) =>
          prev.map((c) => (c.id === comment.id ? res.value : c)),
        );
      }
    } catch (error) {
      setReplies((prev) => prev.filter((r) => r.id !== reply.id));
      replies_count.current -= 1;
      toast.error("Failed to add reply", {
        description: (error as Error).message,
      });
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
        {replies_count.current > 0 && (
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
              : `View ${replies_count.current} repl${replies_count.current > 1 ? "ies" : "y"}`}
          </button>
        )}
      </div>

      {/* Replies */}
      {showReplies && replies_count.current > 0 && (
        <div className="ml-3 space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="space-y-1">
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
