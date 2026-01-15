"use client";
import { Textarea, Button } from "@/components/ui";
import { useState, useRef, useEffect } from "react";

interface CommentFormProps {
  onSubmit: (comment: string) => void;
  onCancel?: () => void;
  buttonLabel?: string;
  autoFocus?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function CommentForm({
  onSubmit,
  onCancel,
  buttonLabel = "Comment",
  autoFocus = false,
  onDirtyChange,
}: CommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onSubmit(newComment);
    handleCancel();
  };

  const handleCancel = () => {
    setNewComment("");
    onCancel?.();
  };

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => onDirtyChange?.(!!newComment.trim()), [newComment]);

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg w-full">
      <Textarea
        value={newComment}
        ref={inputRef}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment…"
        className="bg-background"
      />

      <div className="flex gap-2">
        <Button type="submit">{buttonLabel}</Button>
        {newComment && (
          <Button
            variant="ghost"
            className="fg-muted! hover:fg-primary!"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
